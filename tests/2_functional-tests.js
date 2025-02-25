const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
    let testIssueId; // Store an _id for use in update/delete tests

    suite('POST requests', function() {
        test('Create an issue with every field: POST request to /api/issues/{project}', function(done) {
            chai.request(server)
                .post('/api/issues/testproject')
                .send({
                    issue_title: 'Test Title',
                    issue_text: 'Test Text',
                    created_by: 'Test Creator',
                    assigned_to: 'Test Assignee',
                    status_text: 'Test Status'
                })
                .end(function(err, res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.issue_title, 'Test Title');
                    assert.equal(res.body.issue_text, 'Test Text');
                    assert.equal(res.body.created_by, 'Test Creator');
                    assert.equal(res.body.assigned_to, 'Test Assignee');
                    assert.equal(res.body.status_text, 'Test Status');
                    assert.equal(res.body.project, 'testproject');
                    assert.property(res.body, '_id');
                    testIssueId = res.body._id;  // Save for later tests.
                    done();
                });
        });

        test('Create an issue with only required fields: POST request to /api/issues/{project}', function(done) {
            chai.request(server)
                .post('/api/issues/testproject')
                .send({
                    issue_title: 'Test Title 2',
                    issue_text: 'Test Text 2',
                    created_by: 'Test Creator 2'
                })
                .end(function(err, res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.issue_title, 'Test Title 2');
                    assert.equal(res.body.issue_text, 'Test Text 2');
                    assert.equal(res.body.created_by, 'Test Creator 2');
                    assert.equal(res.body.project, 'testproject');
                    assert.property(res.body, '_id');
                    done();
                });
        });

        test('Create an issue with missing required fields: POST request to /api/issues/{project}', function(done) {
            chai.request(server)
                .post('/api/issues/testproject')
                .send({
                    issue_title: 'Test Title 3'
                })
                .end(function(err, res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.error, 'required field(s) missing');
                    done();
                });
        });
    });

    suite('GET requests', function() {
        test('View issues on a project: GET request to /api/issues/{project}', function(done) {
            chai.request(server)
                .get('/api/issues/testproject')
                .end(function(err, res) {
                    assert.equal(res.status, 200);
                    assert.isArray(res.body);
                    // Add more assertions as needed, based on the data
                    done();
                });
        });

        test('View issues on a project with one filter: GET request to /api/issues/{project}', function(done) {
            chai.request(server)
                .get('/api/issues/testproject?open=true')
                .end(function(err, res) {
                    assert.equal(res.status, 200);
                    assert.isArray(res.body);
                    res.body.forEach(issue => {
                       assert.equal(issue.open, true);
                    });
                    done();
                });
        });

        test('View issues on a project with multiple filters: GET request to /api/issues/{project}', function(done) {
            chai.request(server)
                .get('/api/issues/testproject?open=true&assigned_to=Test%20Assignee')
                .end(function(err, res){
                    assert.equal(res.status, 200);
                    assert.isArray(res.body);
                    res.body.forEach(issue => {
                        assert.equal(issue.open, true);
                        assert.equal(issue.assigned_to, 'Test Assignee')
                    })
                    done();
                });
        });
    });

    suite('PUT requests', function() {
        test('Update one field on an issue: PUT request to /api/issues/{project}', function(done) {
            chai.request(server)
                .put('/api/issues/testproject')
                .send({
                    _id: testIssueId,
                    issue_title: 'Updated Title'
                })
                .end(function(err, res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.result, 'successfully updated');
                    assert.equal(res.body._id, testIssueId);
                    done();
                });
        });

        test('Update multiple fields on an issue: PUT request to /api/issues/{project}', function(done) {
            chai.request(server)
                .put('/api/issues/testproject')
                .send({
                    _id: testIssueId,
                    issue_title: 'Updated Title Again',
                    issue_text: 'Updated Text',
                    open: false
                })
                .end(function(err, res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.result, 'successfully updated');
                    assert.equal(res.body._id, testIssueId);
                    done();
                });
        });

        test('Update an issue with missing _id: PUT request to /api/issues/{project}', function(done) {
            chai.request(server)
                .put('/api/issues/testproject')
                .send({
                    issue_title: 'Updated Title Without ID'
                })
                .end(function(err, res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.error, 'missing _id');
                    done();
                });
        });

        test('Update an issue with no fields to update: PUT request to /api/issues/{project}', function(done) {
           chai.request(server)
                .put('/api/issues/testproject')
                .send({
                    _id: testIssueId
                })
                .end(function(err, res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.error, 'no update field(s) sent');
                    assert.equal(res.body._id, testIssueId);
                    done();
                });
        });

        test('Update an issue with an invalid _id: PUT request to /api/issues/{project}', function(done) {
            chai.request(server)
                .put('/api/issues/testproject')
                .send({
                    _id: 'invalid_id',
                    issue_title: 'Update with Invalid ID'
                })
                .end(function(err, res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.error, 'could not update');
                    assert.equal(res.body._id, 'invalid_id');
                    done();
                });
        });
      test('Update an issue with an invalid _id (5f665eb46e296f6b9b6a504d): PUT request to /api/issues/{project}', function (done) {
        chai.request(server)
          .put('/api/issues/testproject')
          .send({
            _id: "5f665eb46e296f6b9b6a504d",
            issue_title: 'Update with Invalid ID'
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.error, 'could not update');
            done();
          });
      });
    });

    suite('DELETE requests', function() {
        test('Delete an issue: DELETE request to /api/issues/{project}', function(done) {
            chai.request(server)
                .delete('/api/issues/testproject')
                .send({
                    _id: testIssueId
                })
                .end(function(err, res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.result, 'successfully deleted');
                    assert.equal(res.body._id, testIssueId);
                    done();
                });
        });

        test('Delete an issue with an invalid _id: DELETE request to /api/issues/{project}', function(done) {
           chai.request(server)
                .delete('/api/issues/testproject')
                .send({
                    _id: 'invalid_id'
                })
                .end(function(err, res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.error, 'could not delete');
                    assert.equal(res.body._id, 'invalid_id');
                    done();
                });
        });

        test('Delete an issue with missing _id: DELETE request to /api/issues/{project}', function(done) {
            chai.request(server)
                .delete('/api/issues/testproject')
                .send({})
                .end(function(err, res) {
                    assert.equal(res.status, 200);
                    assert.equal(res.body.error, 'missing _id');
                    done();
                });
        });
    });
});
