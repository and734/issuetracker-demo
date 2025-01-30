const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");
const { ObjectId } = require("mongoose").Types;

chai.use(chaiHttp);

suite("Functional Tests", function () {
  var testId;
  var invalidId = new ObjectId();
  test("Test POST /api/issues/apitest for each field", (done) => {
    chai
      .request(server)
      .post("/api/issues/apitest")
      .set("content-type", "application/x-www-form-urlencoded")
      .send({
        issue_title: "test",
        issue_text: "test",
        created_by: "test",
        assigned_to: "test",
        status_text: "test",
        open: "true"
      })
      .end((err, res, body) => {
        if (err) {
          done(error);
        } else {
          let text = res.text.split(":")[1];
          testId = text.split('"')[1];
          assert.equal(res.status, 201);
          done();
        }
      });
  });
  test("Test POST /api/issues/apitest for required fields", (done) => {
    chai
      .request(server)
      .post("/api/issues/apitest")
      .set("content-type", "application/x-www-form-urlencoded")
      .send({
        issue_title: "test",
        issue_text: "test",
        created_by: "test"
      })
      .end((err, res, body) => {
        if (err) {
          done(error);
        } else {
          assert.equal(res.status, 201);
          done();
        }
      });
  });
  test("Test POST /api/issues/apitest with missing required fields", (done) => {
    chai
      .request(server)
      .post("/api/issues/apitest")
      .set("content-type", "application/x-www-form-urlencoded")
      .send({})
      .end((err, res, body) => {
        if (err) {
          done(error);
        } else {
          assert.equal(res.status, 200);
          assert.equal(res.text, '{"error":"required field(s) missing"}');
          done();
        }
      });
  });
  test("Test GET /api/issues/apitest", (done) => {
    chai
      .request(server)
      .get("/api/issues/apitest")
      .end((err, res) => {
        if (err) {
          done(err);
        } else {
          assert.equal(res.status, 200);
          done();
        }
      });
  });
  test("Test GET /api/issues/apitest with one filter", (done) => {
    chai
      .request(server)
      .get("/api/issues/apitest?open=true")
      .end((err, res) => {
        if (err) {
          done(err);
        } else {
          assert.equal(res.status, 200);
          done();
        }
      });
  });
  test("Test GET /api/issues/apitest with multiple filters", (done) => {
    chai
      .request(server)
      .get('/api/issues/apitest?issue_title="test"&issue_text="test"&open=true')
      .end((err, res) => {
        if (err) {
          done(err);
        } else {
          assert.equal(res.status, 200);
          done();
        }
      });
  });
  test("Test PUT /api/issues/apitest on one field", (done) => {
    chai
      .request(server)
      .put("/api/issues/apitest")
      .set("content-type", "application/x-www-form-urlencoded")
      .send({
        _id: testId,
        issue_title: "test2"
      })
      .end((err, res) => {
        if (err || !testId) {
          done(err);
        } else {
          assert.equal(res.status, 200);
          assert.equal(
            res.text,
            '{"result":"successfully updated","_id":"' + testId + '"}'
          );
          done();
        }
      });
  });
  test("Test PUT /api/issues/apitest on multiple fields", (done) => {
    chai
      .request(server)
      .put("/api/issues/apitest")
      .set("content-type", "application/x-www-form-urlencoded")
      .send({
        _id: testId,
        issue_title: "test3",
        issue_text: "test3",
        created_by: "test3",
        assigned_to: "test3",
        status_text: "test3",
        open: "true"
      })
      .end((err, res) => {
        if (err || !testId) {
          done(err);
        } else {
          assert.equal(res.status, 200);
          assert.equal(
            res.text,
            '{"result":"successfully updated","_id":"' + testId + '"}'
          );
          done();
        }
      });
  });
  test("Test PUT /api/issues/apitest with missing _id", (done) => {
    chai
      .request(server)
      .put("/api/issues/apitest")
      .set("content-type", "application/x-www-form-urlencoded")
      .send({
        issue_title: "test3"
      })
      .end((err, res) => {
        if (err) {
          done(err);
        } else {
          assert.equal(res.status, 200);
          assert.equal(res.text, '{"error":"missing _id"}');
          done();
        }
      });
  });
  test("Test PUT /api/issues/apitest with no fields to update", (done) => {
    chai
      .request(server)
      .put("/api/issues/apitest")
      .set("content-type", "application/x-www-form-urlencoded")
      .send({
        _id: testId
      })
      .end((err, res) => {
        if (err || !testId) {
          done(err);
        } else {
          assert.equal(res.status, 200);
          assert.equal(
            res.text,
            '{"error":"no update field(s) sent","_id":"' + testId + '"}'
          );
          done();
        }
      });
  });
  test("Test PUT /api/issues/apitest with invalid _id", (done) => {
    chai
      .request(server)
      .put("/api/issues/apitest")
      .set("content-type", "application/x-www-form-urlencoded")
      .send({
        _id: `${invalidId}`,
        issue_text: "test4"
      })
      .end((err, res) => {
        if (err) {
          done(err);
        } else {
          assert.equal(res.status, 200);
          assert.equal(
            res.text,
            '{"error":"could not update","_id":"' + invalidId + '"}'
          );
          done();
        }
      });
  });
  test("Test DELETE /api/issues/apitest", (done) => {
    chai
      .request(server)
      .delete("/api/issues/apitest")
      .set("content-type", "application/x-www-form-urlencoded")
      .send({
        _id: testId
      })
      .end((err, res) => {
        if (err) {
          done(err);
        } else {
          assert.equal(res.status, 200);
          assert.equal(
            res.text,
            '{"result":"successfully deleted","_id":"' + testId + '"}'
          );
          done();
        }
      });
  });
  test("Test DELETE /api/issues/apitest with an invalid _id", (done) => {
    chai
      .request(server)
      .delete("/api/issues/apitest")
      .set("content-type", "application/x-www-form-urlencoded")
      .send({
        _id: `${invalidId}`
      })
      .end((err, res) => {
        if (err) {
          done(err);
        } else {
          assert.equal(res.status, 200);
          assert.equal(
            res.text,
            '{"error":"could not delete","_id":"' + invalidId + '"}'
          );
          done();
        }
      });
  });
  test("Test DELETE /api/issues/apitest with missing _id", (done) => {
    chai
      .request(server)
      .delete("/api/issues/apitest")
      .set("content-type", "application/x-www-form-urlencoded")
      .send({})
      .end((err, res) => {
        if (err) {
          done(err);
        } else {
          assert.equal(res.status, 200);
          assert.equal(res.text, '{"error":"missing _id"}');
          done();
        }
      });
  });
});
