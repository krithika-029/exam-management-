import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const AllocationHistory = () => {
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchAllocationHistory = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/seatAllocation/history', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch allocation history');
      }

      const data = await response.json();
      setAllocations(data.allocations || []);
    } catch (error) {
      console.error('Error fetching allocation history:', error);
      setError('Failed to load allocation history');
    } finally {
      setLoading(false);
    }
  };

  const clearAllocations = async () => {
    if (!window.confirm('Are you sure you want to clear all allocation history? This will allow all students to be allocated again.')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/seatAllocation/clear', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error('Failed to clear allocations');
      }

      setAllocations([]);
      alert('All allocations cleared successfully!');
    } catch (error) {
      console.error('Error clearing allocations:', error);
      setError('Failed to clear allocations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllocationHistory();
  }, []);

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">
                <i className="fas fa-history me-2"></i>
                Allocation History
              </h4>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <button 
                  className="btn btn-outline-primary"
                  onClick={fetchAllocationHistory}
                  disabled={loading}
                >
                  <i className="fas fa-sync-alt me-2"></i>
                  Refresh
                </button>
                <button 
                  className="btn btn-outline-danger"
                  onClick={clearAllocations}
                  disabled={loading || allocations.length === 0}
                >
                  <i className="fas fa-trash me-2"></i>
                  Clear All Allocations
                </button>
              </div>

              {error && (
                <div className="alert alert-danger" role="alert">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  {error}
                </div>
              )}

              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Loading allocation history...</p>
                </div>
              ) : (
                <>
                  {allocations.length === 0 ? (
                    <div className="text-center py-4">
                      <i className="fas fa-clipboard-list fa-3x text-muted mb-3"></i>
                      <p className="text-muted">No allocations found. All students are available for allocation.</p>
                    </div>
                  ) : (
                    <>
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <div className="alert alert-info">
                            <strong>Total Allocated Students:</strong> {allocations.length}
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="alert alert-warning">
                            <strong>Remaining Available:</strong> {600 - allocations.length} students
                          </div>
                        </div>
                      </div>

                      <div className="table-responsive">
                        <table className="table table-striped table-hover">
                          <thead className="table-dark">
                            <tr>
                              <th>Sl. No.</th>
                              <th>Registration Number</th>
                              <th>Student Name</th>
                              <th>Branch</th>
                              <th>Classroom</th>
                              <th>Allocated Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {allocations.map((allocation, index) => (
                              <tr key={allocation.id}>
                                <td>{index + 1}</td>
                                <td>
                                  <span className="badge bg-primary">
                                    {allocation.registration_number}
                                  </span>
                                </td>
                                <td>{allocation.name}</td>
                                <td>
                                  <span className={`badge ${
                                    allocation.branch === 'CSE' ? 'bg-success' :
                                    allocation.branch === 'EE' ? 'bg-warning' :
                                    allocation.branch === 'ME' ? 'bg-info' :
                                    allocation.branch === 'CV' ? 'bg-secondary' :
                                    allocation.branch === 'EC' ? 'bg-danger' : 'bg-dark'
                                  }`}>
                                    {allocation.branch}
                                  </span>
                                </td>
                                <td>
                                  <span className="badge bg-secondary">
                                    {allocation.room_number} ({allocation.block})
                                  </span>
                                </td>
                                <td>
                                  {new Date(allocation.created_at).toLocaleDateString('en-IN', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllocationHistory;
