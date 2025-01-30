const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const { castObject } = require('../models/Issue');

chai.use(chaiHttp);

suite('Functional Tests', function() {

  test('should create an issue with every field', function(done) {
    chai.request(server)
      .post('/api/issues/test-project')
      .send({
        issue_title: 'Test Issue',
        issue_text: 'This is a test issue',
        created_by: 'Test User',
        assigned_to: 'Test Assignee',
        status_text: 'In Progress'
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.hasAllKeys(res.body, ['project', 'issue_title', 'issue_text', 'created_by', 'assigned_to', 'status_text', 'created_on', 'updated_on', 'open', '_id', '__v']);
        assert.equal(res.body.project, 'test-project');
        assert.equal(res.body.issue_title, 'Test Issue');
        assert.equal(res.body.issue_text, 'This is a test issue');
        assert.equal(res.body.created_by, 'Test User');
        assert.equal(res.body.assigned_to, 'Test Assignee');
        assert.equal(res.body.status_text, 'In Progress');
        assert.isTrue(res.body.open);
        done();
      });
  });

  test('should create an issue with only required fields', function(done) {
    chai.request(server)
      .post('/api/issues/test-project')
      .send({
        issue_title: 'Required Field Issue',
        issue_text: 'This issue has only required fields',
        created_by: 'Test User'
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.hasAllKeys(res.body, ['project', 'issue_title', 'issue_text', 'created_by', 'assigned_to', 'status_text', 'created_on', 'updated_on', 'open', '_id', '__v']);
        assert.equal(res.body.project, 'test-project');
        assert.equal(res.body.issue_title, 'Required Field Issue');
        assert.equal(res.body.issue_text, 'This issue has only required fields');
        assert.equal(res.body.created_by, 'Test User');
        assert.equal(res.body.assigned_to, '');
        assert.equal(res.body.status_text, '');
        assert.isTrue(res.body.open);
        done();
      });
  });

  test('should return an error when creating an issue with missing required fields', function(done) {
    chai.request(server)
      .post('/api/issues/test-project')
      .send({
        issue_title: 'Incomplete Issue',
        issue_text: 'This issue is missing the created_by field'
      })
      .end(function(err, res) {
        assert.equal(res.status, 400);
        assert.isObject(res.body);
        assert.property(res.body, 'error');
        assert.equal(res.body.error, 'required field(s) missing');
        done();
      });
  });

test('should view issues on a project', function(done) {
  chai.request(server)
    .get('/api/issues/test-project')
    .query({ open: true, assigned_to: 'Test Assignee', sort: 'created_on', limit: 5 })
    .end(function(err, res) {
      assert.equal(res.status, 200);
      assert.isArray(res.body);
      assert.isAtMost(res.body.length, 5);
      if (res.body.length > 0) {
        assert.property(res.body[0], 'project');
        assert.property(res.body[0], 'issue_title');
        assert.property(res.body[0], 'issue_text');
        assert.property(res.body[0], 'created_by');
        assert.property(res.body[0], 'assigned_to');
        assert.property(res.body[0], 'status_text');
        assert.property(res.body[0], 'created_on');
        assert.property(res.body[0], 'updated_on');
        assert.property(res.body[0], 'open');
        assert.property(res.body[0], '_id');
        assert.equal(res.body[0].project, 'test-project');
        assert.equal(res.body[0].open, true);
        assert.equal(res.body[0].assigned_to, 'Test Assignee');
      }
      done();
    });
});

test('should view issues on a project with one filter', function(done) {
  chai.request(server)
    .get('/api/issues/test-project')
    .query({ open: true })
    .end(function(err, res) {
      assert.equal(res.status, 200);
      assert.isArray(res.body);
      if (res.body.length > 0) {
        assert.property(res.body[0], 'project');
        assert.property(res.body[0], 'issue_title');
        assert.property(res.body[0], 'issue_text');
        assert.property(res.body[0], 'created_by');
        assert.property(res.body[0], 'assigned_to');
        assert.property(res.body[0], 'status_text');
        assert.property(res.body[0], 'created_on');
        assert.property(res.body[0], 'updated_on');
        assert.property(res.body[0], 'open');
        assert.property(res.body[0], '_id');
        assert.equal(res.body[0].project, 'test-project');
        assert.isTrue(res.body[0].open);
      }
      done();
    });
});

test('should view issues on a project with multiple filters', function(done) {
  chai.request(server)
    .get('/api/issues/test-project')
    .query({ open: true, assigned_to: 'Test Assignee', sort: 'created_on', limit: 3 })
    .end(function(err, res) {
      assert.equal(res.status, 200);
      assert.isArray(res.body);
      assert.isAtMost(res.body.length, 3);
      if (res.body.length > 0) {
        assert.property(res.body[0], 'project');
        assert.property(res.body[0], 'issue_title');
        assert.property(res.body[0], 'issue_text');
        assert.property(res.body[0], 'created_by');
        assert.property(res.body[0], 'assigned_to');
        assert.property(res.body[0], 'status_text');
        assert.property(res.body[0], 'created_on');
        assert.property(res.body[0], 'updated_on');
        assert.property(res.body[0], 'open');
        assert.property(res.body[0], '_id');
        assert.equal(res.body[0].project, 'test-project');
        assert.isTrue(res.body[0].open);
        assert.equal(res.body[0].assigned_to, 'Test Assignee');
      }
      done();
    });
});

test('should update one field on an issue', function(done) {
  chai.request(server)
    .put('/api/issues/test-project')
    .send({
      _id: '679b684ead1166bac25045a3',
      issue_title: 'Updated Issue Title'
    })
    .end(function(err, res) {
      assert.equal(res.status, 200);
      assert.isObject(res.body);
      assert.property(res.body, 'message');
      assert.equal(res.body.message, 'Issue updated!');
      
      // Verify the update by fetching the issue
      chai.request(server)
        .get('/api/issues/test-project')
        .query({ id: '679b684ead1166bac25045a3' })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.equal(res.body[0].issue_title, 'Updated Issue Title');
          done();
        });
    });
});

test('should update multiple fields on an issue', function(done) {
  chai.request(server)
    .put('/api/issues/test-project')
    .send({
      _id: '679b684ead1166bac25045a3',
      issue_title: 'Updated Issue Title',
      issue_text: 'Updated issue text',
      assigned_to: 'New Assignee'
    })
    .end(function(err, res) {
      assert.equal(res.status, 200);
      assert.isObject(res.body);
      assert.property(res.body, 'message');
      assert.equal(res.body.message, 'Issue updated!');
      
      // Verify the update by fetching the issue
      chai.request(server)
        .get('/api/issues/test-project')
        .query({ id: '679b684ead1166bac25045a3' })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.equal(res.body[0].issue_title, 'Updated Issue Title');
          assert.equal(res.body[0].issue_text, 'Updated issue text');
          assert.equal(res.body[0].assigned_to, 'New Assignee');
          done();
        });
    });
});

test('should return an error when updating an issue with missing _id', function(done) {
  chai.request(server)
    .put('/api/issues/test-project')
    .send({
      issue_title: 'Updated Issue Title'
    })
    .end(function(err, res) {
      assert.equal(res.status, 400);
      assert.isObject(res.body);
      assert.property(res.body, 'error');
      assert.equal(res.body.error, 'missing _id');
      done();
    });
});test('should return an error when updating an issue with no fields to update', function(done) {
  chai.request(server)
    .put('/api/issues/test-project')
    .send({
      _id: '679b684ead1166bac25045a3'
    })
    .end(function(err, res) {
      assert.equal(res.status, 400);
      assert.isObject(res.body);
      assert.property(res.body, 'error');
      assert.equal(res.body.error, 'no update field(s) sent');
      done();
    });
});

test('should return an error when updating an issue with an invalid _id', function(done) {
  chai.request(server)
    .put('/api/issues/test-project')
    .send({
      _id: 'invalid_id',
      issue_title: 'Updated Issue Title'
    })
    .end(function(err, res) {
      assert.equal(res.status, 400);
      assert.isObject(res.body);
      assert.property(res.body, 'error');
      assert.equal(res.body.error, 'could not update');
      done();
    });
});

test('should delete an issue', function(done) {
  chai.request(server)
    .delete('/api/issues/test-project')
    .send({
      _id: '679b684ead1166bac25045a3'
    })
    .end(function(err, res) {
      assert.equal(res.status, 200);
      assert.isObject(res.body);
      assert.property(res.body, 'message');
      assert.equal(res.body.message, 'Issue deleted!');
      
      // Verify the deletion by trying to fetch the deleted issue
      chai.request(server)
        .get('/api/issues/test-project')
        .query({ id: '679b684ead1166bac25045a3' })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.isEmpty(res.body);
          done();
        });
    });
});


test('should return an error when deleting an issue with an invalid _id', function(done) {
  chai.request(server)
    .delete('/api/issues/test-project')
    .send({
      _id: 'invalid_id'
    })
    .end(function(err, res) {
      assert.equal(res.status, 400);
      assert.isObject(res.body);
      assert.property(res.body, 'error');
      assert.equal(res.body.error, 'could not delete');
      done();
    });
});

test('should return an error when deleting an issue with missing _id', function(done) {
  chai.request(server)
    .delete('/api/issues/test-project')
    .send({})
    .end(function(err, res) {
      assert.equal(res.status, 400);
      assert.isObject(res.body);
      assert.property(res.body, 'error');
      assert.equal(res.body.error, 'missing _id');
      done();
    });
});
});


