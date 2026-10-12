/**
 * Serializes complaint documents to ensure student identity privacy is preserved
 * based on the requesting user's identity and explicit permissions.
 *
 * Rules:
 * - Student submitter viewing their own complaint can see their identity.
 * - Users with 'complaints.viewSubmitterIdentity' permission (and admin with explicit permission) can see full identity.
 * - Everyone else (faculty, coordinators, facility managers, HODs by default) sees 'Anonymous Student' and NO personal details.
 */
function serializeComplaint(complaintDoc, requestingUser) {
  if (!complaintDoc) return null;

  // Convert to plain JS object if it's a mongoose document
  const complaint = complaintDoc.toObject ? complaintDoc.toObject() : { ...complaintDoc };

  const isOwner =
    requestingUser &&
    complaint.submittedBy &&
    (complaint.submittedBy._id
      ? complaint.submittedBy._id.toString() === requestingUser._id.toString()
      : complaint.submittedBy.toString() === requestingUser._id.toString());

  const hasIdentityPermission =
    requestingUser &&
    requestingUser.permissions &&
    requestingUser.permissions.includes('complaints.viewSubmitterIdentity');

  // Can view identity if owner or has explicit permission
  const canViewIdentity = isOwner || hasIdentityPermission;

  if (canViewIdentity) {
    if (complaint.submittedBy && typeof complaint.submittedBy === 'object') {
      complaint.submitterInfo = {
        name: complaint.submittedBy.name,
        collegeId: complaint.submittedBy.collegeId,
        email: complaint.submittedBy.email,
        department: complaint.submittedBy.departmentId,
        academicYear: complaint.submittedBy.academicYear,
        isMasked: false,
      };
    } else {
      complaint.submitterInfo = {
        name: 'Authorized View',
        isMasked: false,
      };
    }
  } else {
    // Identity Protected / Masked
    complaint.submitterInfo = {
      name: 'Anonymous Student',
      displayName: 'Identity Protected',
      collegeId: '***MASKED***',
      email: '***MASKED***',
      isMasked: true,
    };
    // Redact raw submittedBy object if populated
    if (complaint.submittedBy && typeof complaint.submittedBy === 'object') {
      complaint.submittedBy = {
        _id: complaint.submittedBy._id,
        name: 'Anonymous Student',
      };
    }
  }

  return complaint;
}

function serializeComplaints(complaintDocs, requestingUser) {
  if (!Array.isArray(complaintDocs)) return [];
  return complaintDocs.map((c) => serializeComplaint(c, requestingUser));
}

module.exports = {
  serializeComplaint,
  serializeComplaints,
};
