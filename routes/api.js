'use strict';
const { isValidObjectId } = require('mongoose');
const Issue = require('../models/Issue');
module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(async function (req, res){
      let project = req.params.project;
      //the get function also gets optional querystring parameters "open:boolean" and "assigned_to:string"
      let open = req.query.open === 'true';
      let assigned_to = req.query.assigned_to;
      let id = req.query._id
      let issue_text = req.query.issue_text
      let issue_title = req.query.issue_title
      let created_on = req.query.created_on
      let updated_on = req.query.updated_on
      let status_text = req.query.status_text
      let created_by = req.query.created_by

      let query = {};
      query.project = project
      if(open) query.open = open;
      if(assigned_to) query.assigned_to = assigned_to;
      if (id) query._id = id;
      if(issue_text) query.issue_text = issue_text;
      if(issue_title) query.issue_title = issue_title;
      if(created_on) query.created_on = created_on;
      if(updated_on) query.updated_on = updated_on;
      if(status_text) query.status_text = status_text;
      if(created_by) query.created_by = created_by;

      
      //the find function also uses optional querystring parameters "sort:string" and "limit:number"
      let sort = req.query.sort || '-created_on';
      let limit = parseInt(req.query.limit) || 10;

      
      let docs = await Issue.find(query)
      res.json(docs);
    
    })
    
    .post(async function (req, res){
      let project = req.params.project;

      if (!req.body.issue_text || !req.body.issue_title || !req.body.created_by) return res.json({ error: 'required field(s) missing' })
      let newIssue = await Issue.create({
        project: project,
        issue_title: req.body.issue_title,
        open: req.body.open || true,
        issue_text: req.body.issue_text,
        created_by: req.body.created_by,
        created_on: new Date(),
        assigned_to: req.body.assigned_to || '',
        status_text: req.body.status_text || ''
      })
    
      res.json(newIssue);
    })
    
    .put(async function (req, res){
      let project = req.params.project;
      if (!req.body._id) {
        return res.json({ error: 'missing _id' });
      }
 
      const updateFields = ['issue_title', 'issue_text', 'created_by', 'assigned_to', 'status_text', 'open'];
      const hasUpdateFields = updateFields.some(field => req.body[field] !== undefined);
      if (!hasUpdateFields){
        return res.json({ error: 'no update field(s) sent', '_id': req.body._id });
      }
      var cleanBody = Object.keys(req.body)
      .filter((k) => req.body[k] !== "")
      .reduce((a, k) => ({ ...a, [k]: req.body[k] }), {});
  
    const issue = await Issue.findByIdAndUpdate(
      { _id: req.body._id },
      { $set: cleanBody, updated_on: new Date() },
      { runValidators: true }
    );
  
    if (!issue) {
      res.json({ error: "could not update", '_id': req.body._id });
      return;
    }
    res.json({result: 'successfully updated', '_id': req.body._id});
    })
    
    .delete(async function (req, res){
      let project = req.params.project;
       if (!req.body._id) return res.json({error: 'missing _id'})
      if (!isValidObjectId(req.body._id)) return res.json({error: 'could not delete', '_id': req.body._id})
        // no callbacks on mongoose functions
      
       const issue = await Issue.findOneAndDelete({ _id: req.body._id });

       if (!issue) {
         res.json({ error: "could not delete", '_id': req.body._id });
         return;
       }
      return  res.json({ result: 'successfully deleted', '_id': req.body._id });
      
      });
    
};
