import 'reflect-metadata';
import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { ENTITIES, FitnessClass, Member, MemberMembership, MembershipPlan, ProgressEntry, Role, Trainer, User, Workout } from '../entities';

async function seed() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  const memberPassword=process.env.SEED_DEMO_MEMBER_PASSWORD;
  if (!email || !password || password.startsWith('replace-') || password.length < 12 || !memberPassword || memberPassword.startsWith('replace-') || memberPassword.length < 12) throw new Error('Set both seed passwords to unique values of at least 12 characters in .env before seeding.');
  const ds = new DataSource({ type:'mysql',host:process.env.DB_HOST,port:Number(process.env.DB_PORT||3306),username:process.env.DB_USER,password:process.env.DB_PASSWORD,database:process.env.DB_NAME,entities:ENTITIES,timezone:'Z' });
  await ds.initialize();
  try {
    const plans=ds.getRepository(MembershipPlan), users=ds.getRepository(User), members=ds.getRepository(Member), trainers=ds.getRepository(Trainer);
    const [basic,premium]=await Promise.all([
      plans.findOneBy({planName:'Basic'}).then(x=>x||plans.save(plans.create({planName:'Basic',price:'1200.00',durationMonths:1}))),
      plans.findOneBy({planName:'Premium'}).then(x=>x||plans.save(plans.create({planName:'Premium',price:'2500.00',durationMonths:1}))),
    ]);
    let admin=await users.findOneBy({email:email.toLowerCase()});
    if(!admin) admin=await users.save(users.create({email:email.toLowerCase(),passwordHash:await bcrypt.hash(password,12),role:Role.ADMIN}));
    let demo=await users.findOneBy({email:'member@fitconnect.local'});
    if(!demo) demo=await users.save(users.create({email:'member@fitconnect.local',passwordHash:await bcrypt.hash(memberPassword,12),role:Role.MEMBER}));
    let member=await members.findOneBy({email:'member@fitconnect.local'});
    if(!member) member=await members.save(members.create({firstName:'Alex',lastName:'Rivera',email:'member@fitconnect.local',phone:'09170000001',dateJoined:new Date().toISOString().slice(0,10),plan:basic,user:demo}));
    const trainer=(await trainers.find())[0]||await trainers.save(trainers.create({firstName:'Jamie',lastName:'Reyes',specialization:'Strength Training',contactNumber:'09170000002'}));
    const cls=ds.getRepository(FitnessClass);
    if(!(await cls.count())) await cls.save(cls.create({className:'Starter Strength',schedule:new Date(Date.now()+86400000),capacity:12,trainer}));
    const mm=ds.getRepository(MemberMembership);
    if(!(await mm.count({where:{member:{memberId:member.memberId}} as any}))) await mm.save(mm.create({member,plan:premium,startDate:new Date().toISOString().slice(0,10),endDate:new Date(Date.now()+30*86400000).toISOString().slice(0,10),status:'Active'}));
    const workouts=ds.getRepository(Workout); if(!(await workouts.count())) await workouts.save(workouts.create({member,workoutDate:new Date().toISOString().slice(0,10),activity:'Intro strength session',durationMinutes:40,notes:'Sample seed record'}));
    const progress=ds.getRepository(ProgressEntry); if(!(await progress.count())) await progress.save(progress.create({member,recordedAt:new Date().toISOString().slice(0,10),weightKg:'68.50',notes:'Sample baseline'}));
    console.log(`Seed complete. Admin email: ${email}. Demo member email: member@fitconnect.local (password is SEED_DEMO_MEMBER_PASSWORD).`);
  } finally { await ds.destroy(); }
}
seed().catch(err=>{console.error(err);process.exit(1);});
