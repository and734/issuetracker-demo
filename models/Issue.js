const mongoose = require('mongoose');

const IssueSchema = new mongoose.Schema({
    project: String,
    issue_title: { type: String, required: true },
    issue_text: { type: String, required: true },
    created_on: { type: Date, default: Date.now },
    updated_on: { type: Date, default: Date.now },
    created_by: { type: String, required: true },
    assigned_to: { type: String, default: '' },
    open: { type: Boolean, default: true },
    status_text: { type: String, default: '' }
});

module.exports = mongoose.model('Issue', IssueSchema);