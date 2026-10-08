import React, { createContext, useContext, useState, useEffect } from 'react';

const ScreeningContext = createContext();

export function ScreeningProvider({ children }) {
  const [jobDescription, setJobDescription] = useState({
    id: null,
    title: '',
    rawText: '',
    parsedRequirements: {
      mandatorySkills: [],
      preferredSkills: [],
      minExperienceYears: 0,
      minEducation: '',
    },
  });

  const [currentRunId, setCurrentRunId] = useState(null);
  const [resumes, setResumes] = useState([]);

  // Remove a single uploaded resume from the staged list by its id
  const removeResume = (id) => setResumes((prev) => prev.filter((r) => r.id !== id));
  const [results, setResults] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [evaluationMetrics, setEvaluationMetrics] = useState(null);
  const [skillsDictionary, setSkillsDictionary] = useState([]);
  const [weights, setWeights] = useState({
    mandatory: 0.5,
    preferred: 0.25,
    experience: 0.15,
    education: 0.1,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg, type = 'info') => {
    setToastMessage({ message: msg, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch skill dictionary on load
  const fetchSkillDictionary = async () => {
    try {
      const res = await fetch('/api/skills');
      if (res.ok) {
        const data = await res.json();
        setSkillsDictionary(data);
      }
    } catch (e) {
      console.warn('Could not fetch online skill dictionary:', e.message);
    }
  };

  useEffect(() => {
    fetchSkillDictionary();
  }, []);

  // 1. Submit JD text to API & parse
  const parseJD = async (rawText, title = 'Untitled Position') => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/job-descriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText, title }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to parse Job Description');
      }

      const data = await res.json();
      setJobDescription({
        id: data.id,
        title: data.title,
        rawText: data.rawText,
        parsedRequirements: data.parsedRequirements,
      });

      // Create a draft screening run for this JD
      const runRes = await fetch('/api/runs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jdId: data.id, ...weights }),
      });

      if (runRes.ok) {
        const runData = await runRes.json();
        setCurrentRunId(runData.id);
      }

      showToast('Job Description parsed successfully!', 'success');
      return data;
    } catch (e) {
      setError(e.message);
      showToast(e.message, 'error');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  // Update JD requirements manually
  const updateRequirements = async (updatedReqs) => {
    if (!jobDescription.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/job-descriptions/${jobDescription.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: jobDescription.title,
          rawText: jobDescription.rawText,
          ...updatedReqs,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setJobDescription((prev) => ({
          ...prev,
          parsedRequirements: data.parsedRequirements,
        }));
        showToast('Requirements updated!', 'success');
      }
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // 2. Upload Resumes (Files or Paste)
  const uploadResumes = async (resumeItems) => {
    if (!currentRunId) {
      throw new Error('No active screening run. Please set a Job Description first.');
    }
    setLoading(true);
    try {
      const formData = new FormData();
      const textResumes = [];

      for (const item of resumeItems) {
        if (item instanceof File) {
          formData.append('files', item);
        } else if (item.rawText) {
          textResumes.push(item);
        }
      }

      if (textResumes.length > 0) {
        formData.append('resumes', JSON.stringify(textResumes));
      }

      const res = await fetch(`/api/runs/${currentRunId}/resumes`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to upload resumes.');
      }

      const data = await res.json();
      setResumes((prev) => [...prev, ...data.resumes]);
      showToast(`Uploaded ${data.uploadedCount} resume(s)!`, 'success');
      return data;
    } catch (e) {
      setError(e.message);
      showToast(e.message, 'error');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  // 3. Execute Screening Run Engine
  const executeScreening = async () => {
    if (!currentRunId) throw new Error('No active run to execute.');
    setLoading(true);
    try {
      const res = await fetch(`/api/runs/${currentRunId}/execute`, {
        method: 'POST',
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Screening execution failed.');
      }

      const data = await res.json();
      await fetchResults();
      showToast('Screening pipeline executed successfully!', 'success');
      return data;
    } catch (e) {
      setError(e.message);
      showToast(e.message, 'error');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  // 4. Fetch Results List
  const fetchResults = async (runId = currentRunId) => {
    if (!runId) return;
    try {
      const res = await fetch(`/api/runs/${runId}/results`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.results || []);
      }
    } catch (e) {
      console.error('Error fetching results:', e);
    }
  };

  // 5. Fetch Single Candidate Detailed Report
  const fetchCandidateReport = async (candidateId, runId = currentRunId) => {
    if (!runId || !candidateId) return null;
    try {
      const res = await fetch(`/api/runs/${runId}/results/${candidateId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedCandidate(data);
        return data;
      }
    } catch (e) {
      console.error('Error fetching candidate report:', e);
    }
    return null;
  };

  // 6. Submit Manual Label for Evaluation
  const submitManualLabel = async (resumeId, label) => {
    if (!currentRunId) return;
    try {
      const res = await fetch(`/api/runs/${currentRunId}/labels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeId, label }),
      });

      if (res.ok) {
        showToast(`Ground-truth label set to '${label}'`, 'success');
        fetchResults();
        fetchEvaluationMetrics();
      }
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  // 7. Fetch Evaluation Metrics
  const fetchEvaluationMetrics = async (runId = currentRunId) => {
    if (!runId) return;
    try {
      const res = await fetch(`/api/runs/${runId}/evaluation`);
      if (res.ok) {
        const data = await res.json();
        setEvaluationMetrics(data);
      }
    } catch (e) {
      console.error('Error fetching evaluation metrics:', e);
    }
  };

  // 8. Update Weights and Re-screen
  const updateWeights = async (newWeights) => {
    if (!currentRunId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/runs/${currentRunId}/weights`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newWeights, reexecute: true }),
      });

      if (res.ok) {
        setWeights(newWeights);
        await fetchResults();
        showToast('Weights updated & re-screened!', 'success');
      }
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // 9. Save Recruiter Note
  const saveRecruiterNote = async (resumeId, noteText) => {
    try {
      const res = await fetch(`/api/resumes/${resumeId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noteText }),
      });

      if (res.ok) {
        showToast('Recruiter note saved.', 'success');
        if (selectedCandidate && selectedCandidate.resumeId === resumeId) {
          setSelectedCandidate((prev) => ({ ...prev, recruiterNote: noteText }));
        }
      }
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  // Remove single candidate result from results & resumes list
  const removeCandidateResult = async (resumeId) => {
    try {
      if (currentRunId && resumeId) {
        await fetch(`/api/runs/${currentRunId}/resumes/${resumeId}`, { method: 'DELETE' });
      }
    } catch (e) {
      console.warn('Backend delete error:', e);
    }
    setResumes((prev) => prev.filter((r) => String(r.id) !== String(resumeId)));
    setResults((prev) => {
      const filtered = prev.filter((r) => String(r.resumeId) !== String(resumeId) && String(r.id) !== String(resumeId));
      return filtered.map((item, idx) => ({ ...item, rank: idx + 1 }));
    });
    showToast('Candidate removed from results.', 'info');
  };

  // Clear all candidate results and staged resumes
  const clearAllResults = async () => {
    if (results.length === 0 && resumes.length === 0) return;
    if (currentRunId) {
      for (const r of resumes) {
        try {
          await fetch(`/api/runs/${currentRunId}/resumes/${r.id}`, { method: 'DELETE' });
        } catch (e) {}
      }
    }
    setResumes([]);
    setResults([]);
    showToast('All candidate results cleared.', 'info');
  };

  return (
    <ScreeningContext.Provider
      value={{
        jobDescription,
        currentRunId,
        resumes,
        results,
        selectedCandidate,
        evaluationMetrics,
        skillsDictionary,
        weights,
        loading,
        error,
        toastMessage,
        parseJD,
        updateRequirements,
        uploadResumes,
        executeScreening,
        fetchResults,
        fetchCandidateReport,
        submitManualLabel,
        fetchEvaluationMetrics,
        updateWeights,
        saveRecruiterNote,
        fetchSkillDictionary,
        removeResume,
        removeCandidateResult,
        clearAllResults,
        showToast,
      }}
    >
      {children}
    </ScreeningContext.Provider>
  );
}

export function useScreening() {
  return useContext(ScreeningContext);
}
