/**
 * App test
 *
 * @author Evan MacGregor
 */
import request from 'supertest';
import app from '../src/app';

describe('GET /unknown-url', () => {
  it('should return 404', done => {
    request(app)
      .get('/test')
      .expect(404, done);
  });
});
