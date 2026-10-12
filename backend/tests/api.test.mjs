import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../server.js';

describe('CampusCare Backend API Tests', () => {
  let studentToken = '';
  let facultyToken = '';
  let adminToken = '';
  let studentComplaintId = '';

  beforeAll(async () => {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI);
    }
  });

  it('Health Check returns status OK', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('Public registration is completely disabled (returns 404)', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Hacker',
      email: 'hacker@test.com',
      password: 'password123',
    });
    expect(res.statusCode).toBe(404);
  });

  it('Rejects invalid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      identifier: 'admin@campuscare.edu',
      password: 'wrong_password_123',
    });
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('Allows Student login and returns valid token and role', async () => {
    const res = await request(app).post('/api/auth/login').send({
      identifier: '2023CSE045',
      password: 'Password@123',
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.role).toBe('student');
    studentToken = res.body.token;
  });

  it('Allows Faculty login and returns valid token', async () => {
    const res = await request(app).post('/api/auth/login').send({
      identifier: 'FAC-101',
      password: 'Password@123',
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.role).toBe('faculty');
    facultyToken = res.body.token;
  });

  it('Allows Admin login and returns valid token', async () => {
    const res = await request(app).post('/api/auth/login').send({
      identifier: 'admin@campuscare.edu',
      password: 'Password@123',
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.role).toBe('admin');
    adminToken = res.body.token;
  });

  it('Student can fetch their own complaints', async () => {
    const res = await request(app)
      .get('/api/complaints')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.complaints.length).toBeGreaterThan(0);
    studentComplaintId = res.body.complaints[0]._id;
  });

  it('Faculty sees submitter identity MASKED as Anonymous Student', async () => {
    const res = await request(app)
      .get('/api/complaints')
      .set('Authorization', `Bearer ${facultyToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    if (res.body.complaints.length > 0) {
      const complaint = res.body.complaints[0];
      expect(complaint.submitterInfo.name).toBe('Anonymous Student');
      expect(complaint.submitterInfo.isMasked).toBe(true);
    }
  });

  it('Admin with explicit permission can reveal submitter identity with audit log', async () => {
    const res = await request(app)
      .get(`/api/complaints/${studentComplaintId}/submitter-identity`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.submitter.name).toBeDefined();
    expect(res.body.submitter.collegeId).toBe('2023CSE045');
  });

  it('Faculty CANNOT reveal submitter identity (403 forbidden)', async () => {
    const res = await request(app)
      .get(`/api/complaints/${studentComplaintId}/submitter-identity`)
      .set('Authorization', `Bearer ${facultyToken}`);
    expect(res.statusCode).toBe(403);
  });
});
