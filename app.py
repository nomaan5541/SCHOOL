from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
from flask_sqlalchemy import SQLAlchemy
from werkzeug.utils import secure_filename
from datetime import datetime, date
from sqlalchemy import Numeric
import os
from decimal import Decimal

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-here'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///school_management.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = 'static/images/students'

# Create upload folder if it doesn't exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

db = SQLAlchemy(app)

# Database Models
class Student(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    roll_number = db.Column(db.String(20), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    father_name = db.Column(db.String(100), nullable=False)
    mother_name = db.Column(db.String(100), nullable=False)
    gender = db.Column(db.String(10), nullable=False)
    dob = db.Column(db.Date, nullable=False)
    phone_number = db.Column(db.String(15), nullable=False)
    pen_number = db.Column(db.String(50))
    bio = db.Column(db.Text)
    photo_url = db.Column(db.String(200))
    admission_no = db.Column(db.String(20), unique=True, nullable=False)
    admission_date = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(20), default='active')
    address = db.Column(db.Text)
    city = db.Column(db.String(50))
    state = db.Column(db.String(50))
    pincode = db.Column(db.String(10))
    blood_group = db.Column(db.String(5))
    class_name = db.Column(db.String(20), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    attendance_records = db.relationship('Attendance', backref='student', lazy=True)
    fee_records = db.relationship('FeeRecord', backref='student', lazy=True)

class Attendance(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student.id'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(10), nullable=False)  # present, absent
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class FeeStructure(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    class_name = db.Column(db.String(20), nullable=False)
    fee_type = db.Column(db.String(20), nullable=False)  # monthly, quarterly, annual
    amount = db.Column(Numeric(10, 2), nullable=False)
    percentage = db.Column(Numeric(5, 2), default=35.00)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class FeeRecord(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student.id'), nullable=False)
    amount_paid = db.Column(Numeric(10, 2), nullable=False)
    total_amount = db.Column(Numeric(10, 2), nullable=False)
    percentage_paid = db.Column(Numeric(5, 2), nullable=False)
    payment_date = db.Column(db.Date, nullable=False)
    payment_method = db.Column(db.String(20), nullable=False)  # cash, online
    remarks = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# Routes
@app.route('/')
def dashboard():
    # Get statistics for dashboard
    total_students = Student.query.filter_by(status='active').count()
    total_classes = len(['Nursery', 'LKG', 'UKG', '1st CLASS', '2nd CLASS', '3rd CLASS', '4th CLASS', '5th CLASS', '6th CLASS', '7th CLASS'])
    
    # Calculate total fees and dues
    total_fees_collected = db.session.query(db.func.sum(FeeRecord.amount_paid)).scalar() or 0
    
    # Get recent activities (last 10 fee payments)
    recent_activities = FeeRecord.query.join(Student).order_by(FeeRecord.created_at.desc()).limit(10).all()
    
    stats = {
        'classes': total_classes,
        'fees': f"₹{total_fees_collected:,.2f}",
        'students': total_students,
        'dues': 0  # Calculate based on pending fees
    }
    
    return render_template('dashboard.html', stats=stats, activities=recent_activities)

@app.route('/all-classes')
def all_classes():
    classes = ['Nursery', 'LKG', 'UKG', '1st CLASS', '2nd CLASS', '3rd CLASS', '4th CLASS', '5th CLASS', '6th CLASS', '7th CLASS']
    class_stats = []
    
    for class_name in classes:
        student_count = Student.query.filter_by(class_name=class_name, status='active').count()
        class_stats.append({
            'name': class_name,
            'count': student_count
        })
    
    return render_template('all_classes.html', classes=class_stats)

@app.route('/class/<class_name>')
def class_students(class_name):
    students = Student.query.filter_by(class_name=class_name, status='active').order_by(Student.roll_number).all()
    return render_template('class_students.html', students=students, class_name=class_name)

@app.route('/add-student')
def add_student():
    return render_template('add_student.html')

@app.route('/add-student', methods=['POST'])
def add_student_post():
    try:
        # Handle file upload
        photo_url = None
        if 'photo' in request.files:
            file = request.files['photo']
            if file.filename != '':
                filename = secure_filename(file.filename)
                file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
                photo_url = f'static/images/students/{filename}'
        
        student = Student(
            roll_number=request.form['roll_number'],
            name=request.form['name'],
            father_name=request.form['father_name'],
            mother_name=request.form['mother_name'],
            gender=request.form['gender'],
            dob=datetime.strptime(request.form['dob'], '%Y-%m-%d').date(),
            phone_number=request.form['phone_number'],
            pen_number=request.form.get('pen_number'),
            bio=request.form.get('bio'),
            photo_url=photo_url,
            admission_no=request.form['admission_no'],
            admission_date=datetime.strptime(request.form['admission_date'], '%Y-%m-%d').date(),
            address=request.form.get('address'),
            city=request.form.get('city'),
            state=request.form.get('state'),
            pincode=request.form.get('pincode'),
            blood_group=request.form.get('blood_group'),
            class_name=request.form['class_name']
        )
        
        db.session.add(student)
        db.session.commit()
        flash('Student added successfully!', 'success')
        return redirect(url_for('dashboard'))
    except Exception as e:
        flash(f'Error adding student: {str(e)}', 'error')
        return redirect(url_for('add_student'))

@app.route('/student/<int:student_id>')
def student_profile(student_id):
    student = Student.query.get_or_404(student_id)
    fee_history = FeeRecord.query.filter_by(student_id=student_id).order_by(FeeRecord.created_at.desc()).all()
    return render_template('student_profile.html', student=student, fee_history=fee_history)

@app.route('/attendance/<class_name>')
def attendance(class_name):
    students = Student.query.filter_by(class_name=class_name, status='active').order_by(Student.roll_number).all()
    today = date.today()
    
    # Check if attendance already taken today
    existing_attendance = Attendance.query.filter_by(date=today).first()
    
    return render_template('attendance.html', students=students, class_name=class_name, 
                         today=today, existing_attendance=existing_attendance)

@app.route('/mark-attendance', methods=['POST'])
def mark_attendance():
    try:
        attendance_date = datetime.strptime(request.form['date'], '%Y-%m-%d').date()
        class_name = request.form['class_name']
        
        # Delete existing attendance for this date and class
        Attendance.query.filter_by(date=attendance_date).join(Student).filter(Student.class_name == class_name).delete()
        
        # Add new attendance records
        for key, value in request.form.items():
            if key.startswith('attendance_'):
                student_id = int(key.split('_')[1])
                attendance = Attendance(
                    student_id=student_id,
                    date=attendance_date,
                    status=value
                )
                db.session.add(attendance)
        
        db.session.commit()
        flash('Attendance marked successfully!', 'success')
        return redirect(url_for('attendance', class_name=class_name))
    except Exception as e:
        flash(f'Error marking attendance: {str(e)}', 'error')
        return redirect(url_for('attendance', class_name=class_name))

@app.route('/fees')
def fees():
    fee_structures = FeeStructure.query.all()
    return render_template('fees.html', fee_structures=fee_structures)

@app.route('/add-fee-payment/<int:student_id>')
def add_fee_payment(student_id):
    student = Student.query.get_or_404(student_id)
    fee_structure = FeeStructure.query.filter_by(class_name=student.class_name).first()
    return render_template('add_fee_payment.html', student=student, fee_structure=fee_structure)

@app.route('/add-fee-payment', methods=['POST'])
def add_fee_payment_post():
    try:
        student_id = int(request.form['student_id'])
        total_amount = Decimal(request.form['total_amount'])
        percentage_paid = Decimal(request.form['percentage_paid'])
        amount_paid = (total_amount * percentage_paid) / 100
        
        fee_record = FeeRecord(
            student_id=student_id,
            amount_paid=amount_paid,
            total_amount=total_amount,
            percentage_paid=percentage_paid,
            payment_date=datetime.strptime(request.form['payment_date'], '%Y-%m-%d').date(),
            payment_method=request.form['payment_method'],
            remarks=request.form.get('remarks')
        )
        
        db.session.add(fee_record)
        db.session.commit()
        flash('Fee payment recorded successfully!', 'success')
        return redirect(url_for('student_profile', student_id=student_id))
    except Exception as e:
        flash(f'Error recording payment: {str(e)}', 'error')
        return redirect(url_for('fees'))

@app.route('/calculate-fee-amount', methods=['POST'])
def calculate_fee_amount():
    percentage = float(request.json['percentage'])
    total_amount = float(request.json['total_amount'])
    amount_paid = (total_amount * percentage) / 100
    return jsonify({'amount_paid': amount_paid})

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        
        # Create sample fee structures if none exist
        if not FeeStructure.query.first():
            classes = ['Nursery', 'LKG', 'UKG', '1st CLASS', '2nd CLASS', '3rd CLASS', '4th CLASS', '5th CLASS', '6th CLASS', '7th CLASS']
            for class_name in classes:
                if class_name in ['Nursery', 'LKG', 'UKG']:
                    amount = 3000
                else:
                    amount = 5000
                
                fee_structure = FeeStructure(
                    class_name=class_name,
                    fee_type='monthly',
                    amount=amount,
                    percentage=35.00
                )
                db.session.add(fee_structure)
            
            db.session.commit()
    
    app.run(debug=True)
