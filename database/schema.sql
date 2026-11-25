CREATE DATABASE IF NOT EXISTS fitconnect CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE fitconnect;

CREATE TABLE IF NOT EXISTS users (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('Member','Trainer','Staff','Admin') NOT NULL DEFAULT 'Member',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS membership_plans (
  plan_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  plan_name VARCHAR(50) NOT NULL UNIQUE,
  price DECIMAL(8,2) NOT NULL CHECK (price > 0),
  duration_months INT NOT NULL CHECK (duration_months > 0)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS members (
  member_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  phone VARCHAR(15) NOT NULL,
  date_joined DATE NOT NULL,
  plan_id INT NULL,
  user_id INT NULL UNIQUE,
  deleted_at DATETIME(6) NULL,
  CONSTRAINT fk_member_plan FOREIGN KEY (plan_id) REFERENCES membership_plans(plan_id) ON DELETE SET NULL,
  CONSTRAINT fk_member_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS member_memberships (
  membership_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  member_id INT NOT NULL,
  plan_id INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status ENUM('Active','Expired','Cancelled') NOT NULL DEFAULT 'Active',
  CONSTRAINT fk_membership_member FOREIGN KEY (member_id) REFERENCES members(member_id) ON DELETE CASCADE,
  CONSTRAINT fk_membership_plan FOREIGN KEY (plan_id) REFERENCES membership_plans(plan_id) ON DELETE RESTRICT,
  CONSTRAINT chk_membership_dates CHECK (end_date >= start_date)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS trainers (
  trainer_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  specialization VARCHAR(50) NOT NULL,
  contact_number VARCHAR(15) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS fitness_classes (
  class_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  class_name VARCHAR(50) NOT NULL,
  schedule DATETIME NOT NULL,
  capacity INT NOT NULL CHECK (capacity > 0),
  trainer_id INT NOT NULL,
  CONSTRAINT fk_class_trainer FOREIGN KEY (trainer_id) REFERENCES trainers(trainer_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS bookings (
  booking_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  member_id INT NOT NULL,
  class_id INT NOT NULL,
  booking_date DATE NOT NULL,
  status ENUM('Confirmed','Cancelled','Completed') NOT NULL DEFAULT 'Confirmed',
  CONSTRAINT fk_booking_member FOREIGN KEY (member_id) REFERENCES members(member_id) ON DELETE RESTRICT,
  CONSTRAINT fk_booking_class FOREIGN KEY (class_id) REFERENCES fitness_classes(class_id) ON DELETE RESTRICT,
  INDEX idx_booking_class_status (class_id,status),
  INDEX idx_booking_member_status (member_id,status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS payments (
  payment_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL UNIQUE,
  amount_paid DECIMAL(8,2) NOT NULL CHECK (amount_paid > 0),
  payment_date DATE NOT NULL,
  payment_method VARCHAR(20) NOT NULL,
  CONSTRAINT fk_payment_booking FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS workouts (
  workout_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  member_id INT NOT NULL,
  workout_date DATE NOT NULL,
  activity VARCHAR(100) NOT NULL,
  duration_minutes INT NOT NULL CHECK (duration_minutes > 0 AND duration_minutes <= 1440),
  notes TEXT NULL,
  CONSTRAINT fk_workout_member FOREIGN KEY (member_id) REFERENCES members(member_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS progress_entries (
  progress_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  member_id INT NOT NULL,
  recorded_at DATE NOT NULL,
  weight_kg DECIMAL(5,2) NULL,
  body_fat_percent DECIMAL(5,2) NULL,
  notes TEXT NULL,
  CONSTRAINT fk_progress_member FOREIGN KEY (member_id) REFERENCES members(member_id) ON DELETE CASCADE,
  CONSTRAINT chk_body_fat CHECK (body_fat_percent IS NULL OR (body_fat_percent > 0 AND body_fat_percent <= 100))
) ENGINE=InnoDB;
