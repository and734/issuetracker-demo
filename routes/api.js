'use strict';

const mongoose = require('mongoose');

// Connect to the database (using the DB_URI from .env)
mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Define the Issue Schema
const issueSchema = new mongoose.Schema({
  project: { type: String, required: true },
  issue_title: { type: String, required: true },
  issue_text: { type: String, required: true },
  created_by: { type: String, required: true },
  assigned_to: { type: String, default: '' },
  status_text: { type: String, default: '' },
  created_on: { type: Date, default: Date.now },
  updated_on: { type: Date, default: Date.now },
  open: { type: Boolean, default: true }
});

// Create the Issue Model
const Issue = mongoose.model('Issue', issueSchema);

module.exports = function (app) {

  app.route('/api/issues/:project')

    .get(async function (req, res) {
      let project = req.params.project;
      let filter = { project: project, ...req.query };

        // Convert 'open' query parameter to boolean if it exists
        if (filter.open) {
            filter.open = (filter.open === 'true');
        }

      try {
        const issues = await Issue.find(filter);
        res.json(issues);
      } catch (err) {
        res.status(500).json({ error: 'Could not retrieve issues', details: err.message });
      }
    })

    .post(async function (req, res) {
      let project = req.params.project;
      const { issue_title, issue_text, created_by, assigned_to, status_text } = req.body;

      if (!issue_title || !issue_text || !created_by) {
        return res.json({ error: 'required field(s) missing' });
      }

      const newIssue = new Issue({
        project: project,
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text
      });

      try {
        const savedIssue = await newIssue.save();
        res.json(savedIssue);
      } catch (err) {
        res.status(500).json({ error: 'Could not create issue', details: err.message });
      }
    })

    .put(async function (req, res) {
      let project = req.params.project;
      const { _id, ...updates } = req.body;

      if (!_id) {
        return res.json({ error: 'missing _id' });
      }

      if (Object.keys(updates).length === 0) {
          return res.json({ error: 'no update field(s) sent', '_id': _id });
      }

      // Prepare update object, filtering out empty fields and adding updated_on
        const updateObject = { updated_on: new Date() };
        for (const key in updates) {
            if (updates[key] !== '' && key !== '_id') {  // Exclude _id from updates
                if(key === 'open'){
                    updateObject[key] = !(updates[key] === 'true');
                }else{
                    updateObject[key] = updates[key];
                }
            }
        }

        if (Object.keys(updateObject).length === 1) { // Only updated_on was set
            return res.json({ error: 'no update field(s) sent', '_id': _id });
        }
        

      try {
        const updatedIssue = await Issue.findByIdAndUpdate(
          _id,
          updateObject,
          { new: true } // Return the updated document
        );

        if (!updatedIssue) {
          return res.json({ error: 'could not update', '_id': _id });
        }

        res.json({ result: 'successfully updated', '_id': _id });
      } catch (err) {
          return res.json({ error: 'could not update', '_id': _id });
      }
    })

    .delete(async function (req, res) {
      let project = req.params.project;
      const { _id } = req.body;

      if (!_id) {
        return res.json({ error: 'missing _id' });
      }

      try {
        const deletedIssue = await Issue.findByIdAndDelete(_id);

        if (!deletedIssue) {
          return res.json({ error: 'could not delete', '_id': _id });
        }

        res.json({ result: 'successfully deleted', '_id': _id });
      } catch (err) {
        return res.json({ error: 'could not delete', '_id': _id });
      }
    });
};
