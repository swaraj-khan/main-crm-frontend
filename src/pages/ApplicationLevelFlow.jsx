import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ModifyModal from './ModifyModal';
import { supabase } from './supabaseClient';

const DISPOSITION_OPTIONS = [
  "CALL_ATTEMPT_NO_ANSWER", "CALL_ATTEMPT_NOT_REACHABLE", "CALL_ATTEMPT_WRONG_NUMBER",
  "CALL_ATTEMPT_BUSY_DECLINED", "VOICEMAIL_SENT", "FOLLOW_UP_SCHEDULED",
  "CONNECTED_SCREENING_COMPLETED", "CONNECTED_INTERESTED", "CONNECTED_NOT_INTERESTED",
  "CONNECTED_REQUESTED_CALLBACK", "CONNECTED_NEEDS_MORE_INFO", "QUALIFIED_MEETS_ALL_CRITERIA",
  "PARTIALLY_QUALIFIED_MISSING_DOCUMENTS", "PARTIALLY_QUALIFIED_MISSING_EXPERIENCE",
  "NOT_QUALIFIED", "UNDER_REVIEW_VERIFICATION_IN_PROGRESS", "DOCUMENTS_SUBMITTED_PENDING_REVIEW",
  "DOCUMENTS_APPROVED", "DOCUMENTS_REJECTED_REUPLOAD_REQUIRED", "VERIFICATION_COMPLETED",
  "VERIFICATION_FAILED", "INTERVIEW_SCHEDULED", "INTERVIEW_RESCHEDULED",
  "INTERVIEW_COMPLETED_SELECTED", "INTERVIEW_COMPLETED_ON_HOLD", "INTERVIEW_COMPLETED_REJECTED",
  "CANDIDATE_NO_SHOW_INTERVIEW", "OFFER_EXTENDED", "OFFER_ACCEPTED", "OFFER_DECLINED",
  "ONBOARDING_INITIATED", "ONBOARDING_COMPLETED", "CANDIDATE_UNRESPONSIVE",
  "CANDIDATE_WITHDREW_APPLICATION", "CANDIDATE_JOINED_ANOTHER_EMPLOYER", "DUPLICATE_APPLICATION",
  "APPLICATION_CLOSED_BY_EMPLOYER", "VISA_DOCUMENTATION_STARTED", "VISA_APPROVED",
  "TRAVEL_SCHEDULED", "CANDIDATE_DEPLOYED", "DEPLOYMENT_DELAYED",
];

const UserDetailsPopup = ({ userId, baseData }) => {
  const [user, setUser] = useState(baseData);
  const [loading, setLoading] = useState(!baseData);

  useEffect(() => {
    if (baseData) setUser(baseData);
  }, [baseData]);

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return;
      if (!baseData) setLoading(true);
      try {
        const [profileRes, crmRes] = await Promise.all([
          supabase.from('user_profiles').select('*').eq('user_id', userId).maybeSingle(),
          supabase.from('userflow_crm').select('*').eq('user_id', userId).maybeSingle()
        ]);

        const sbProfile = profileRes.data;
        const sbCrm = crmRes.data;

        setUser(prev => ({
          ...(prev || {}),
          skills: sbProfile?.skills || prev?.skills,
          language: sbProfile?.language || prev?.language,
          education: sbProfile?.education || prev?.education,
          experience: sbProfile?.experience || prev?.experience,
          dob: sbProfile?.dob || prev?.dob,
          gender: sbProfile?.gender || prev?.gender,
          location: sbProfile?.location || prev?.location,
          fullName: sbCrm?.full_name || prev?.fullName,
        }));
      } catch (error) {
        console.error(`Error fetching user details for ID ${userId}:`, error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [userId]);

  if (!userId) return null;

  return (
    <div className="fixed top-0 bottom-0 w-96 bg-white shadow-2xl z-[80] overflow-hidden flex flex-col border border-gray-200 left-4 2xl:left-auto 2xl:right-[65rem]">
      <div className="p-4 bg-gray-100 border-b">
        <h3 className="font-bold text-lg">User Details</h3>
      </div>
      <div className="p-4 overflow-y-auto flex-1 text-sm space-y-4">
        {loading ? <p>Loading...</p> : user ? (
          <>
            <div>Full Name: {user.fullName || '-'}</div>
            <div>Passport: {user.passportNumber || '-'}</div>
            <div>DOB: {user.dob ? new Date(user.dob.$date || user.dob).toLocaleDateString() : '-'}</div>
            <div>Gender: {user.gender || '-'}</div>
            <div>Experience Type: {user.experienceType || '-'}</div>
            <div>Location: {user.location ? [user.location.city, user.location.state, user.location.country].filter(Boolean).join(', ') : '-'}</div>
            <div>Secondary Countries: {(user.secondaryCountries || []).map(c => c.name).join(', ') || '-'}</div>
            <div>Secondary Job Roles: {(user.secondaryJobRoles || []).map(r => r.name).join(', ') || '-'}</div>
            <div>Skills: {(user.skills || []).join(', ') || '-'}</div>
            <div>Languages: {user.language ? [user.language.motherTongue, ...(user.language.other || [])].filter(Boolean).join(', ') : '-'}</div>
            
            <h4 className="font-semibold mt-4 border-b pb-1">Education</h4>
            {Array.isArray(user.education) && user.education.length > 0 ? user.education.map((edu, i) => (
              <div key={i} className="p-2 border rounded bg-gray-50 mt-2">
                <div className="font-medium">{edu.degree}</div>
                <div className="text-xs text-gray-500">{edu.institutionName}</div>
              </div>
            )) : (
              user.education && !Array.isArray(user.education) ? <div className="p-2 border rounded bg-gray-50 mt-2">{user.education}</div> : <p className="text-gray-500">No education info</p>
            )}

            <h4 className="font-semibold mt-4 border-b pb-1">Experience</h4>
            {Array.isArray(user.experience) && user.experience.length > 0 ? user.experience.map((exp, i) => (
              <div key={i} className="p-2 border rounded bg-gray-50 mt-2">
                <div className="font-medium">{exp.position}</div>
                <div className="text-xs text-gray-500">{exp.companyName}</div>
              </div>
            )) : (
              user.experience && !Array.isArray(user.experience) ? <div className="p-2 border rounded bg-gray-50 mt-2">{user.experience}</div> : <p className="text-gray-500">No experience info</p>
            )}
          </>
        ) : <p>User details not found.</p>}
      </div>
    </div>
  );
};

const ApplicationLevelFlow = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDisposition, setFilterDisposition] = useState('');
  const [filterUserInfo, setFilterUserInfo] = useState('');
  const [filterCountry, setFilterCountry] = useState('');
  const [filterJobRole, setFilterJobRole] = useState('');
  const [filterAssignee, setFilterAssignee] = useState('');
  const [filterMissingDetails, setFilterMissingDetails] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppForModify, setSelectedAppForModify] = useState(null);
  const [downloadType, setDownloadType] = useState('all');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [assignees, setAssignees] = useState([]);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [currentPage, filterUserInfo, filterCountry, filterJobRole, filterDisposition, filterAssignee, filterMissingDetails, filterStartDate, filterEndDate]);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    getUser();
  }, []);

  useEffect(() => {
    const syncAssignees = async () => {
      const { data: sbData } = await supabase
        .from('user_assignments')
        .select('assigned_to');
      
      const sbAssignees = sbData ? sbData.map(item => item.assigned_to).filter(Boolean) : [];
      const localAssignees = users.map(u => u.assignee).filter(Boolean);
      const unique = [...new Set([...sbAssignees, ...localAssignees])].sort();
      setAssignees(unique);
    };
    syncAssignees();
  }, [users]);

  const fetchData = async () => {
    try {
      const params = {
        page: currentPage,
        limit: 100,
        userInfo: filterUserInfo,
        country: filterCountry,
        jobRole: filterJobRole,
        disposition: filterDisposition,
        assignee: filterAssignee,
        missingDetails: filterMissingDetails,
        startDate: filterStartDate,
        endDate: filterEndDate,
      };
      const response = await axios.get('/api/crm/application-level', { params });
      const { data: responseData, total } = response.data;
      
      const mappedData = responseData.map(u => {
        const getOid = (val) => (val && typeof val === 'object' && val.$oid) ? val.$oid : val;
        const cleanUserId = getOid(u.userId) || getOid(u.user?._id) || (typeof u.user === 'string' ? u.user : "") || getOid(u._id) || "";

        return {
          ...u,
          _id: getOid(u._id), 
          assignee: u.crmData?.assignee || "",
          tempDisposition: u.crmData?.callDisposition || "",
          tempNotes: u.crmData?.notes || "",
          tempNextCallDate: u.crmData?.nextCallDate ? u.crmData.nextCallDate.split('T')[0] : "",
          userId: cleanUserId,
          passportNumber: u.user?.passportNumber || u.passportNumber || "",
          dob: u.user?.dob || u.dob || null,
          gender: u.user?.gender || u.gender || "",
          experienceType: u.user?.experienceType || u.experienceType || "",
          location: u.user?.location || u.location || null,
          secondaryCountries: u.user?.secondaryCountries || u.secondaryCountries || [],
          secondaryJobRoles: u.user?.secondaryJobRoles || u.secondaryJobRoles || [],
          skills: u.user?.skills || u.skills || [],
          language: u.user?.language || u.language || {},
          education: u.user?.education || u.education || [],
          experience: u.user?.experience || u.experience || [],
        };
      });

      const userIds = [...new Set(mappedData.map(u => u.userId).filter(Boolean))];
      
      let sbProfiles = [];
      let sbCrmData = [];
      let sbAssignments = [];

      if (userIds.length > 0) {
        const [sbProfilesResult, sbCrmResult, sbAssignmentsResult] = await Promise.all([
          supabase.from('user_profiles').select('*').in('user_id', userIds),
          supabase.from('userflow_crm').select('*').in('user_id', userIds),
          supabase.from('user_assignments').select('*').in('user_id', userIds)
        ]);
        sbProfiles = sbProfilesResult.data || [];
        sbCrmData = sbCrmResult.data || [];
        sbAssignments = sbAssignmentsResult.data || [];
      }

      const initializedData = mappedData.map(u => {
        const sbProfile = sbProfiles.find(p => p.user_id === u.userId);
        const sbCrm = sbCrmData.find(c => c.user_id === u.userId);
        const sbAssignment = sbAssignments.find(a => a.user_id === u.userId);

        return {
          ...u,
          skills: sbProfile?.skills || u.skills,
          language: sbProfile?.language || u.language,
          education: sbProfile?.education || u.education,
          experience: sbProfile?.experience || u.experience,
          dob: sbProfile?.dob || u.dob,
          gender: sbProfile?.gender || u.gender,
          location: sbProfile?.location || u.location,
          
          fullName: sbCrm?.full_name || u.fullName,
          targetCountry: sbCrm?.target_country || u.targetCountry,
          targetJobRole: sbCrm?.target_job_role || u.targetJobRole,
          
          assignee: sbAssignment?.assigned_to || u.assignee,
          tempDisposition: sbCrm?.call_disposition || u.tempDisposition,
          tempNotes: sbCrm?.notes || u.tempNotes,
          tempNextCallDate: sbCrm?.next_call_date ? sbCrm.next_call_date.split('T')[0] : u.tempNextCallDate,
        };
      });

      let filteredData = initializedData;

      if (filterStartDate) {
        const start = new Date(filterStartDate);
        filteredData = filteredData.filter(u => {
          const d = u.createdAt ? (u.createdAt.$date || u.createdAt) : null;
          return d && new Date(d) >= start;
        });
      }
      if (filterEndDate) {
        const end = new Date(filterEndDate);
        end.setHours(23, 59, 59, 999);
        filteredData = filteredData.filter(u => {
          const d = u.createdAt ? (u.createdAt.$date || u.createdAt) : null;
          return d && new Date(d) <= end;
        });
      }

      if (filterMissingDetails === 'Yes') {
        filteredData = filteredData.filter(u => !u.fullName || !u.targetCountry || !u.targetJobRole);
      } else if (filterMissingDetails === 'No') {
        filteredData = filteredData.filter(u => u.fullName && u.targetCountry && u.targetJobRole);
      }

      setUsers(filteredData);
      setTotalRecords(total);
      setLoading(false);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching app level data", error);
      setLoading(false);
    }
  };

  const handleAssign = async (application) => {
    if (!currentUser?.email) return;
    const assignee = currentUser.email;

    setUsers(prev => prev.map(u => u._id === application._id ? { ...u, assignee } : u));

    try {
      await axios.post('/api/crm/crm-update', {
        userId: application.userId,
        applicationId: application._id,
        assignee: assignee
      });
      await supabase.from('user_assignments').upsert({ user_id: application.userId, assigned_to: assignee });

    } catch (error) {
      console.error("Error assigning user", error);
      alert('Failed to assign. Please try again.');
      fetchData();
    }
  };

  const handleSaveFromModal = async (modifiedApplication) => {
    setUsers(prev => prev.map(u => {
      if (u._id === modifiedApplication._id) {
        return {
          ...u,
          tempDisposition: modifiedApplication.tempDisposition,
          tempNotes: modifiedApplication.tempNotes,
          tempNextCallDate: modifiedApplication.tempNextCallDate,
          fullName: modifiedApplication.fullName,
          targetCountry: modifiedApplication.targetCountry.name || u.targetCountry,
          targetJobRole: modifiedApplication.targetJobRole.name || u.targetJobRole,
          skills: modifiedApplication.skills,
          language: modifiedApplication.language,
          education: modifiedApplication.education,
          experience: modifiedApplication.experience,
          dob: modifiedApplication.dob,
          gender: modifiedApplication.gender,
          location: modifiedApplication.location,
        };
      }
      return u;
    }));

    try {
      // 1. Save Profile Data to user_profiles
      const sbProfilePayload = {
        user_id: modifiedApplication.userId,
        skills: modifiedApplication.skills,
        language: modifiedApplication.language,
        education: modifiedApplication.education,
        experience: modifiedApplication.experience,
        dob: modifiedApplication.dob || null,
        gender: modifiedApplication.gender,
        location: modifiedApplication.location,
        updated_at: new Date().toISOString()
      };

      const { error: profileError } = await supabase.from('user_profiles').upsert(sbProfilePayload);
      if (profileError) throw profileError;

      await axios.post('/api/crm/crm-update', {
        userId: modifiedApplication.userId,
        applicationId: modifiedApplication._id,
        callDisposition: modifiedApplication.tempDisposition,
        notes: modifiedApplication.tempNotes,
        nextCallDate: modifiedApplication.tempNextCallDate || null,
        fullName: modifiedApplication.fullName,
        targetCountry: typeof modifiedApplication.targetCountry === 'object' ? modifiedApplication.targetCountry.name : modifiedApplication.targetCountry,
        targetJobRole: typeof modifiedApplication.targetJobRole === 'object' ? modifiedApplication.targetJobRole.name : modifiedApplication.targetJobRole,
      });
      alert('Saved successfully');
      
      const originalRecord = users.find(u => u._id === modifiedApplication._id);
      const needsRefetch = 
        (modifiedApplication.fullName && modifiedApplication.fullName !== originalRecord?.fullName) ||
        (modifiedApplication.targetCountry.name && modifiedApplication.targetCountry.name !== originalRecord?.targetCountry) ||
        (modifiedApplication.targetJobRole.name && modifiedApplication.targetJobRole.name !== originalRecord?.targetJobRole);

      if (needsRefetch) {
        setTimeout(() => fetchData(), 500);
      }
    } catch (error) {
      console.error("Error saving CRM data", error);
      alert('Error saving data');
      fetchData();
    }
  };

  const openModifyModal = (application) => {
    setSelectedAppForModify(application);
    setIsModalOpen(true);
  };

  const totalCount = users.length;
  const addressedCount = users.filter(u => u.tempDisposition).length;

  const uniqueCountries = [...new Set(users.map(item => item.targetCountry).filter(Boolean))];
  const uniqueJobRoles = [...new Set(users.map(item => item.targetJobRole).filter(Boolean))];

  const downloadCSV = async () => {
    try {
      setIsDownloading(true);
      let allData = [];
      const limit = 100;

      const params = {
        page: 1,
        limit,
        userInfo: filterUserInfo,
        country: filterCountry,
        jobRole: filterJobRole,
        disposition: filterDisposition,
        assignee: filterAssignee,
        missingDetails: filterMissingDetails,
        startDate: filterStartDate,
        endDate: filterEndDate,
      };

      const response = await axios.get('/api/crm/application-level', { params });
      const { data: firstPageData, total } = response.data;
      
      const mapRecord = (u) => ({
            ...u,
            assignee: u.crmData?.assignee || "",
            tempDisposition: u.crmData?.callDisposition || "",
            tempNotes: u.crmData?.notes || "",
            tempNextCallDate: u.crmData?.nextCallDate ? u.crmData.nextCallDate.split('T')[0] : ""
      });

      if (firstPageData && firstPageData.length > 0) {
        allData.push(...firstPageData.map(mapRecord));
      }

      const totalPages = Math.ceil(total / limit);
      
      if (totalPages > 1) {
        const batchSize = 5;
        for (let i = 2; i <= totalPages; i += batchSize) {
          const batchPromises = [];
          for (let j = i; j < i + batchSize && j <= totalPages; j++) {
            batchPromises.push(axios.get('/api/crm/application-level', { params: { ...params, page: j } }));
          }
          
          const batchResponses = await Promise.all(batchPromises);
          batchResponses.forEach(res => {
            const { data: pageData } = res.data;
            if (pageData && pageData.length > 0) {
              allData.push(...pageData.map(mapRecord));
            }
          });
        }
      }

      let filteredData = allData;

      if (filterStartDate) {
        const start = new Date(filterStartDate);
        filteredData = filteredData.filter(u => {
          const d = u.createdAt ? (u.createdAt.$date || u.createdAt) : null;
          return d && new Date(d) >= start;
        });
      }
      if (filterEndDate) {
        const end = new Date(filterEndDate);
        end.setHours(23, 59, 59, 999);
        filteredData = filteredData.filter(u => {
          const d = u.createdAt ? (u.createdAt.$date || u.createdAt) : null;
          return d && new Date(d) <= end;
        });
      }

      if (filterMissingDetails === 'Yes') {
        filteredData = filteredData.filter(u => !u.targetCountry || !u.targetJobRole);
      } else if (filterMissingDetails === 'No') {
        filteredData = filteredData.filter(u => u.fullName && u.targetCountry && u.targetJobRole);
      }

      let dataToDownload = filteredData;
      if (downloadType === 'addressed') {
        dataToDownload = filteredData.filter(u => u.tempDisposition);
      } else if (downloadType === 'unaddressed') {
        dataToDownload = filteredData.filter(u => !u.tempDisposition);
      }

      const headers = ['Application ID', 'User ID', 'Created At', 'Full Name', 'Phone Number', 'Target Country', 'Target Job Role', 'Job Title', 'Company', 'Salary', 'Assignee'];
      const csvRows = [headers.join(',')];

      dataToDownload.forEach(user => {
        const salary = user.jobSnapshot?.salary ? `${user.jobSnapshot.salary.min || 0} - ${user.jobSnapshot.salary.max || 0} ${user.jobSnapshot.salary.currency || ''}` : '';
        const row = [
          user._id,
          user.userId,
          user.createdAt ? `"${new Date(user.createdAt).toLocaleString()}"` : '',
          `"${(user.fullName || '').replace(/"/g, '""')}"`,
          `"${(user.phoneNumber || '').replace(/"/g, '""')}"`,
          `"${(user.targetCountry || '').replace(/"/g, '""')}"`,
          `"${(user.targetJobRole || '').replace(/"/g, '""')}"`,
          `"${(user.jobTitle || '').replace(/"/g, '""')}"`,
          `"${(user.companyName || '').replace(/"/g, '""')}"`,
          `"${salary.replace(/"/g, '""')}"`,
          `"${(user.assignee || '').replace(/"/g, '""')}"`
        ];
        csvRows.push(row.join(','));
      });

      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `crm-data-${downloadType}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading CSV", error);
      alert("Failed to download CSV");
    } finally {
      setIsDownloading(false);
    }
  };

  if (loading) return <div>Loading Application Flow...</div>;

  return (
    <>
      {isModalOpen && (
        <>
          <UserDetailsPopup userId={selectedAppForModify?.userId} baseData={selectedAppForModify} />
          <ModifyModal record={selectedAppForModify} type="application" onClose={() => setIsModalOpen(false)} onSave={handleSaveFromModal}/>
        </>
      )}

    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Application Level Workflow</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            Live
          </div>
          <span className="text-sm text-gray-500">Updated: {lastUpdated.toLocaleTimeString()}</span>
          <button onClick={fetchData} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm">Refresh</button>
        </div>
      </div>
      
      <div className="flex flex-wrap items-center justify-between mb-4 gap-4">
        <div className="flex gap-4">
          <div className="bg-blue-100 p-2 rounded">Total: <strong>{totalCount}</strong></div>
          <div className="bg-green-100 p-2 rounded">Addressed: <strong>{addressedCount}</strong></div>
          <div className="bg-yellow-100 p-2 rounded">Filtered: <strong>{totalRecords}</strong></div>
        </div>

        <div className="flex gap-2 items-center flex-wrap">
          <input 
            type="text" 
            placeholder="Search User Info..." 
            className="border p-2 rounded"
            value={filterUserInfo}
            onChange={(e) => setFilterUserInfo(e.target.value)}
          />
          <select 
            className="border p-2 rounded"
            value={filterCountry}
            onChange={(e) => setFilterCountry(e.target.value)}
          >
            <option value="">Filter Country: All</option>
            {uniqueCountries.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select 
            className="border p-2 rounded"
            value={filterJobRole}
            onChange={(e) => setFilterJobRole(e.target.value)}
          >
            <option value="">Filter Job Role: All</option>
            {uniqueJobRoles.map(r => <option key={r} value={r}>{r}</option>)}
          </select>

          <select 
            className="border p-2 rounded"
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value)}
          >
            <option value="">Filter Assignee: All</option>
            <option value="Unassigned">Unassigned</option>
            {assignees.map(a => <option key={a} value={a}>{a}</option>)}
          </select>

          <select 
            className="border p-2 rounded"
            value={filterDisposition}
            onChange={(e) => setFilterDisposition(e.target.value)}
          >
            <option value="">Filter Disposition: All</option>
            {DISPOSITION_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>

          <select 
            className="border p-2 rounded"
            value={filterMissingDetails}
            onChange={(e) => setFilterMissingDetails(e.target.value)}
          >
            <option value="">Filter Missing Details: All</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>

          <div className="flex items-center gap-2">
            <input 
              type="date" 
              className="border p-2 rounded" 
              value={filterStartDate} 
              onChange={(e) => setFilterStartDate(e.target.value)} 
              title="Start Date"
            />
            <span className="text-gray-500">-</span>
            <input 
              type="date" 
              className="border p-2 rounded" 
              value={filterEndDate} 
              onChange={(e) => setFilterEndDate(e.target.value)} 
              title="End Date"
            />
          </div>

          <div className="flex border rounded overflow-hidden">
            <select className="p-2 bg-gray-50 border-r" value={downloadType} onChange={(e) => setDownloadType(e.target.value)}>
              <option value="all">Full Sheet</option>
              <option value="addressed">Addressed Only</option>
              <option value="unaddressed">Unaddressed Only</option>
              <option value="filtered">Filtered View</option>
            </select>
            <button onClick={downloadCSV} disabled={isDownloading} className="bg-gray-800 text-white px-4 py-2 hover:bg-gray-700 disabled:bg-gray-400">
              {isDownloading ? 'Downloading...' : 'Download CSV'}
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border w-16">S.No</th>
              <th className="p-2 border">Created At</th>
              <th className="p-2 border">User Info</th>
              <th className="p-2 border">Target Country</th>
              <th className="p-2 border">Target Job Role</th>
              <th className="p-2 border">Job Info</th>
              <th className="p-2 border">Assign To</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={user._id} className="hover:bg-gray-50">
                <td className="p-2 border text-center">{(currentPage - 1) * 100 + index + 1}</td>
                <td className="p-2 border text-sm">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                  <div className="text-xs text-gray-500">
                    {user.createdAt ? new Date(user.createdAt).toLocaleTimeString() : ''}
                  </div>
                </td>
                <td className="p-2 border">
                  <div className="font-bold">{user.fullName}</div>
                  <div className="text-sm text-gray-600">{user.phoneNumber}</div>
                  <div className="text-xs text-gray-400 font-mono">UID: {user.userId}</div>
                </td>
                <td className="p-2 border">{user.targetCountry || '-'}</td>
                <td className="p-2 border">{user.targetJobRole || '-'}</td>
                <td className="p-2 border">
                  <div className="font-medium text-sm">{user.jobTitle}</div>
                  <div className="text-xs text-gray-500">{user.companyName}</div>
                  <div className="text-xs text-gray-500">
                    {user.jobSnapshot?.salary?.min || 0} - {user.jobSnapshot?.salary?.max || 0} {user.jobSnapshot?.salary?.currency || ''}
                  </div>
                </td>
                <td className="p-2 border">
                  <div className="flex items-center gap-2">
                    {user.assignee ? (
                      user.assignee === currentUser?.email ? (
                        // Assigned to me: Show nothing here, Record Activity button is shown below
                        <span className="hidden"></span>
                      ) : (
                        <span className="text-xs text-gray-500">Assigned to {user.assignee}</span>
                      )
                    ) : (
                      <button
                        onClick={() => handleAssign(user)}
                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-xs whitespace-nowrap"
                      >
                        Assign Me
                      </button>
                    )}
                    
                    {(user.assignee === currentUser?.email) && (
                      <button
                        onClick={() => openModifyModal(user)}
                        className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700 whitespace-nowrap"
                      >
                        Record Activity
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-center items-center mt-4 gap-4">
          <button 
            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} 
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span>Page {currentPage} of {Math.ceil(totalRecords / 100)}</span>
          <button 
            onClick={() => setCurrentPage(p => p + 1)} 
            disabled={currentPage * 100 >= totalRecords}
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
    </>
  );
};

export default ApplicationLevelFlow;