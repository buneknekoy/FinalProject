import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';

export enum Role { MEMBER = 'Member', TRAINER = 'Trainer', STAFF = 'Staff', ADMIN = 'Admin' }
export enum BookingStatus { CONFIRMED = 'Confirmed', CANCELLED = 'Cancelled', COMPLETED = 'Completed' }

@Entity('users')
export class User {
  @PrimaryGeneratedColumn() id: number;
  @Column({ unique: true, length: 100 }) email: string;
  @Column({ name: 'password_hash', select: false }) passwordHash: string;
  @Column({ type: 'enum', enum: Role, default: Role.MEMBER }) role: Role;
  @Column({ name: 'is_active', default: true }) isActive: boolean;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @OneToOne(() => Member, m => m.user) member: Relation<Member>;
}
@Entity('membership_plans')
export class MembershipPlan {
  @PrimaryGeneratedColumn({ name: 'plan_id' }) planId: number;
  @Column({ name: 'plan_name', length: 50, unique: true }) planName: string;
  @Column({ type: 'decimal', precision: 8, scale: 2 }) price: string;
  @Column({ name: 'duration_months' }) durationMonths: number;
  @OneToMany(() => Member, m => m.plan) members: Member[];
}
@Entity('members')
export class Member {
  @PrimaryGeneratedColumn({ name: 'member_id' }) memberId: number;
  @Column({ name: 'first_name', length: 50 }) firstName: string;
  @Column({ name: 'last_name', length: 50 }) lastName: string;
  @Column({ unique: true, length: 100 }) email: string;
  @Column({ length: 15 }) phone: string;
  @Column({ name: 'date_joined', type: 'date' }) dateJoined: string;
  @DeleteDateColumn({ name: 'deleted_at', nullable: true }) deletedAt: Date;
  @ManyToOne(() => MembershipPlan, p => p.members, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'plan_id' }) plan: MembershipPlan;
  @OneToOne(() => User, u => u.member, { nullable: true, onDelete: 'SET NULL' }) @JoinColumn({ name: 'user_id' }) user: User;
  @OneToMany(() => Booking, b => b.member) bookings: Booking[];
  @OneToMany(() => MemberMembership, mm => mm.member) memberships: MemberMembership[];
  @OneToMany(() => Workout, w => w.member) workouts: Workout[];
  @OneToMany(() => ProgressEntry, p => p.member) progress: ProgressEntry[];
}
@Entity('member_memberships')
export class MemberMembership {
  @PrimaryGeneratedColumn({ name: 'membership_id' }) membershipId: number;
  @ManyToOne(() => Member, m => m.memberships, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'member_id' }) member: Member;
  @ManyToOne(() => MembershipPlan, { onDelete: 'RESTRICT' }) @JoinColumn({ name: 'plan_id' }) plan: MembershipPlan;
  @Column({ name: 'start_date', type: 'date' }) startDate: string;
  @Column({ name: 'end_date', type: 'date' }) endDate: string;
  @Column({ name: 'status', type: 'enum', enum: ['Active', 'Expired', 'Cancelled'], default: 'Active' }) status: string;
}
@Entity('trainers')
export class Trainer {
  @PrimaryGeneratedColumn({ name: 'trainer_id' }) trainerId: number;
  @Column({ name: 'first_name', length: 50 }) firstName: string;
  @Column({ name: 'last_name', length: 50 }) lastName: string;
  @Column({ length: 50 }) specialization: string;
  @Column({ name: 'contact_number', length: 15 }) contactNumber: string;
  @OneToMany(() => FitnessClass, c => c.trainer) classes: FitnessClass[];
}
@Entity('fitness_classes')
export class FitnessClass {
  @PrimaryGeneratedColumn({ name: 'class_id' }) classId: number;
  @Column({ name: 'class_name', length: 50 }) className: string;
  @Column({ type: 'datetime' }) schedule: Date;
  @Column() capacity: number;
  @ManyToOne(() => Trainer, t => t.classes, { onDelete: 'RESTRICT' }) @JoinColumn({ name: 'trainer_id' }) trainer: Trainer;
  @OneToMany(() => Booking, b => b.fitnessClass) bookings: Booking[];
}
@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn({ name: 'booking_id' }) bookingId: number;
  @ManyToOne(() => Member, m => m.bookings, { onDelete: 'RESTRICT' }) @JoinColumn({ name: 'member_id' }) member: Member;
  @ManyToOne(() => FitnessClass, c => c.bookings, { onDelete: 'RESTRICT' }) @JoinColumn({ name: 'class_id' }) fitnessClass: FitnessClass;
  @Column({ name: 'booking_date', type: 'date' }) bookingDate: string;
  @Column({ type: 'enum', enum: BookingStatus, default: BookingStatus.CONFIRMED }) status: BookingStatus;
  @OneToOne(() => Payment, p => p.booking) payment: Relation<Payment>;
}
@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn({ name: 'payment_id' }) paymentId: number;
  @OneToOne(() => Booking, b => b.payment, { onDelete: 'RESTRICT' }) @JoinColumn({ name: 'booking_id' }) booking: Booking;
  @Column({ name: 'amount_paid', type: 'decimal', precision: 8, scale: 2 }) amountPaid: string;
  @Column({ name: 'payment_date', type: 'date' }) paymentDate: string;
  @Column({ name: 'payment_method', length: 20 }) paymentMethod: string;
}
@Entity('workouts')
export class Workout {
  @PrimaryGeneratedColumn({ name: 'workout_id' }) workoutId: number;
  @ManyToOne(() => Member, m => m.workouts, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'member_id' }) member: Member;
  @Column({ name: 'workout_date', type: 'date' }) workoutDate: string;
  @Column({ name: 'activity', length: 100 }) activity: string;
  @Column({ name: 'duration_minutes' }) durationMinutes: number;
  @Column({ type: 'text', nullable: true }) notes: string;
}
@Entity('progress_entries')
export class ProgressEntry {
  @PrimaryGeneratedColumn({ name: 'progress_id' }) progressId: number;
  @ManyToOne(() => Member, m => m.progress, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'member_id' }) member: Member;
  @Column({ name: 'recorded_at', type: 'date' }) recordedAt: string;
  @Column({ name: 'weight_kg', type: 'decimal', precision: 5, scale: 2, nullable: true }) weightKg: string;
  @Column({ name: 'body_fat_percent', type: 'decimal', precision: 5, scale: 2, nullable: true }) bodyFatPercent: string;
  @Column({ type: 'text', nullable: true }) notes: string;
}

export const ENTITIES = [User, MembershipPlan, Member, MemberMembership, Trainer, FitnessClass, Booking, Payment, Workout, ProgressEntry];
