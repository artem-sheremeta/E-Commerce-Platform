import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  // it('/auth/register (POST)', async () => {
  //   const res = await request(app.getHttpServer()).post('/auth/register').send({
  //     username: 'test11',
  //     email: 'test11@e2e.com',
  //     password: 'test11',
  //     role: 'seller',
  //   });

  //   expect(res.status).toBe(201);
  //   expect(res.body).toHaveProperty('message', 'User created successfully');
  // });

  it('/auth/login (POST)', async () => {
    const res = await request(app.getHttpServer()).post('/auth/login').send({
      login: 'test11',
      password: 'test11',
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('access_token');
  });

  afterAll(async () => {
    await app.close();
  });
});
