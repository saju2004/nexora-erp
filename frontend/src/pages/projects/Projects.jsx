import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Briefcase, CheckCircle2, Clock, ListTodo } from 'lucide-react';
import api from '../../services/api';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';

const Projects = () => {
  const { showToast } = useToast();

  const [projects, setProjects] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Selected Project & Tasks
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);

  // Modals
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);

  const [projectForm, setProjectForm] = useState({
    name: '',
    projectCode: 'PRJ-' + Math.floor(100 + Math.random() * 900),
    clientName: '',
    startDate: new Date().toISOString().slice(0, 10),
    endDate: '',
    budget: '150000',
    priority: 'HIGH',
    description: '',
  });

  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    assignedTo: 'Sajith Ahamed',
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    priority: 'MEDIUM',
    estimatedHours: '16',
  });

  const fetchProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/projects', {
        params: {
          search: search || undefined,
          status: statusFilter || undefined,
          page,
          size: 15,
        },
      });
      if (res.success && res.data) {
        setProjects(res.data.content || []);
        setTotalCount(res.data.totalElements || 0);
        if (!selectedProjectId && res.data.content?.length > 0) {
          setSelectedProjectId(res.data.content[0].id);
        }
      }
    } catch (err) {
      showToast('Failed to load projects: ' + err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [page, search, statusFilter, selectedProjectId, showToast]);

  const fetchTasks = useCallback(async () => {
    if (!selectedProjectId) return;
    try {
      setIsLoadingTasks(true);
      const res = await api.get('/projects/tasks', {
        params: { projectId: selectedProjectId, size: 50 },
      });
      if (res.success && res.data) {
        setTasks(res.data.content || []);
      }
    } catch (err) {
      showToast('Failed to load tasks: ' + err.message, 'error');
    } finally {
      setIsLoadingTasks(false);
    }
  }, [selectedProjectId, showToast]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await api.post('/projects', {
        ...projectForm,
        budget: Number(projectForm.budget),
      });
      showToast('Project initialized successfully', 'success');
      setIsAddProjectOpen(false);
      fetchProjects();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!selectedProjectId) return;
    try {
      await api.post('/projects/tasks', {
        ...taskForm,
        project: { id: selectedProjectId },
        estimatedHours: Number(taskForm.estimatedHours),
        status: 'TODO',
      });
      showToast('Task assigned to project', 'success');
      setIsAddTaskOpen(false);
      fetchTasks();
      fetchProjects(); // update progress %
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleTaskStatusChange = async (taskId, newStatus) => {
    try {
      await api.put(`/projects/tasks/${taskId}/status`, { status: newStatus });
      showToast(`Task status updated to ${newStatus}`, 'success');
      fetchTasks();
      fetchProjects(); // update progress %
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const activeProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

  const columns = [
    {
      key: 'projectCode',
      title: 'Code',
      width: '100px',
      sortable: true,
      render: (val, row) => (
        <span
          style={{
            fontWeight: 600,
            color: selectedProjectId === row.id ? '#2563eb' : 'inherit',
            cursor: 'pointer',
          }}
          onClick={() => setSelectedProjectId(row.id)}
        >
          {val}
        </span>
      ),
    },
    {
      key: 'name',
      title: 'Project Title',
      sortable: true,
      render: (val, row) => (
        <div style={{ cursor: 'pointer' }} onClick={() => setSelectedProjectId(row.id)}>
          <div style={{ fontWeight: 600 }}>{val}</div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
            Client: {row.clientName || 'Internal Enterprise'}
          </div>
        </div>
      ),
    },
    {
      key: 'budget',
      title: 'Budget (AED)',
      sortable: true,
      render: (val) => `AED ${Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
    },
    {
      key: 'progressPercentage',
      title: 'Progress',
      sortable: true,
      render: (val) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '120px' }}>
          <div
            style={{
              flex: 1,
              height: '6px',
              backgroundColor: 'var(--color-bg-subtle)',
              borderRadius: '3px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${val || 0}%`,
                height: '100%',
                backgroundColor: val === 100 ? 'var(--status-success-text)' : 'var(--color-accent)',
              }}
            />
          </div>
          <span style={{ fontSize: '11.5px', fontWeight: 600, width: '32px' }}>{val || 0}%</span>
        </div>
      ),
    },
    {
      key: 'priority',
      title: 'Priority',
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: 'status',
      title: 'Status',
      render: (val) => <StatusBadge status={val} />,
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-title-group">
          <h1>Project Management & Deliverables</h1>
          <p>Portfolio oversight, milestone completion tracking, and work packages.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary btn-sm" onClick={() => setIsAddProjectOpen(true)}>
            <Plus size={14} /> Initialize Project
          </button>
        </div>
      </div>

      {/* Projects Table */}
      <div style={{ marginBottom: '24px' }}>
        <DataTable
          columns={columns}
          data={projects}
          isLoading={isLoading}
          totalItems={totalCount}
          page={page}
          pageSize={15}
          onPageChange={setPage}
          searchPlaceholder="Search project code or title..."
          searchValue={search}
          onSearchChange={setSearch}
          filterOptions={[
            { label: 'In Progress', value: 'IN_PROGRESS' },
            { label: 'Planning', value: 'PLANNING' },
            { label: 'Completed', value: 'COMPLETED' },
            { label: 'On Hold', value: 'ON_HOLD' },
          ]}
          filterValue={statusFilter}
          onFilterChange={setStatusFilter}
          emptyTitle="No projects registered"
          emptyDescription="Initialize your first enterprise transformation project."
          onAddRecord={() => setIsAddProjectOpen(true)}
          exportFileName="projects-portfolio"
        />
      </div>

      {/* Project Tasks Split View */}
      {activeProject && (
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                Task Breakdown: {activeProject.name} ({activeProject.projectCode})
              </div>
              <div className="card-subtitle">
                Current Completion: <strong>{activeProject.progressPercentage}%</strong> &bull; Client:{' '}
                {activeProject.clientName || 'Internal'}
              </div>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => setIsAddTaskOpen(true)}>
              <Plus size={13} /> Add Task
            </button>
          </div>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Task Title & Scope</th>
                  <th>Assigned Specialist</th>
                  <th>Due Date</th>
                  <th>Est. Hours</th>
                  <th>Priority</th>
                  <th>Workflow Status</th>
                  <th>Decision</th>
                </tr>
              </thead>
              <tbody>
                {isLoadingTasks ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                      Loading project tasks...
                    </td>
                  </tr>
                ) : tasks.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-muted)' }}>
                      No tasks assigned yet. Click "Add Task" to start breaking down milestones.
                    </td>
                  </tr>
                ) : (
                  tasks.map((task) => (
                    <tr key={task.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{task.title}</div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                          {task.description || 'Deliverable task package'}
                        </div>
                      </td>
                      <td>{task.assignedTo || 'Unassigned'}</td>
                      <td>{task.dueDate || '—'}</td>
                      <td>{task.estimatedHours} hrs</td>
                      <td>
                        <StatusBadge status={task.priority} />
                      </td>
                      <td>
                        <StatusBadge status={task.status} />
                      </td>
                      <td>
                        <select
                          className="form-select"
                          style={{ height: '28px', fontSize: '12px', padding: '0 6px', width: '130px' }}
                          value={task.status}
                          onChange={(e) => handleTaskStatusChange(task.id, e.target.value)}
                        >
                          <option value="TODO">To Do</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="REVIEW">Review</option>
                          <option value="DONE">Completed (Done)</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Initialize Project Modal */}
      <Modal
        isOpen={isAddProjectOpen}
        onClose={() => setIsAddProjectOpen(false)}
        title="Initialize Enterprise Project"
        size="lg"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsAddProjectOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleCreateProject}>
              Launch Project
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateProject}>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label form-label-required">Project Name</label>
              <input
                type="text"
                className="form-input"
                value={projectForm.name}
                onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                placeholder="e.g. Core Banking System Integration"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label form-label-required">Project Identifier Code</label>
              <input
                type="text"
                className="form-input"
                value={projectForm.projectCode}
                onChange={(e) => setProjectForm({ ...projectForm, projectCode: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Client / Sponsor Organization</label>
              <input
                type="text"
                className="form-input"
                value={projectForm.clientName}
                onChange={(e) => setProjectForm({ ...projectForm, clientName: e.target.value })}
                placeholder="e.g. Gulf Commercial Bank PJSC"
              />
            </div>
            <div className="form-group">
              <label className="form-label form-label-required">Allocated Budget (AED)</label>
              <input
                type="number"
                className="form-input"
                value={projectForm.budget}
                onChange={(e) => setProjectForm({ ...projectForm, budget: e.target.value })}
                step="5000"
                min="0"
                required
              />
            </div>
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label form-label-required">Start Date</label>
              <input
                type="date"
                className="form-input"
                value={projectForm.startDate}
                onChange={(e) => setProjectForm({ ...projectForm, startDate: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Target Completion Date</label>
              <input
                type="date"
                className="form-input"
                value={projectForm.endDate}
                onChange={(e) => setProjectForm({ ...projectForm, endDate: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select
                className="form-select"
                value={projectForm.priority}
                onChange={(e) => setProjectForm({ ...projectForm, priority: e.target.value })}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Executive Scope & Deliverables</label>
            <textarea
              className="form-textarea"
              value={projectForm.description}
              onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
              placeholder="Outline project objectives, phases, and key deliverables..."
            />
          </div>
        </form>
      </Modal>

      {/* Add Task Modal */}
      <Modal
        isOpen={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
        title={`Add Milestone Task to ${activeProject?.name}`}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsAddTaskOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleCreateTask}>
              Create Task
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateTask}>
          <div className="form-group">
            <label className="form-label form-label-required">Task Title</label>
            <input
              type="text"
              className="form-input"
              value={taskForm.title}
              onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              placeholder="e.g. Conduct ISO Security Audit on Database Ports"
              required
            />
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Assigned Specialist</label>
              <input
                type="text"
                className="form-input"
                value={taskForm.assignedTo}
                onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                placeholder="Team member name"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input
                type="date"
                className="form-input"
                value={taskForm.dueDate}
                onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Estimated Effort (Hours)</label>
              <input
                type="number"
                className="form-input"
                value={taskForm.estimatedHours}
                onChange={(e) => setTaskForm({ ...taskForm, estimatedHours: e.target.value })}
                min="1"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select
                className="form-select"
                value={taskForm.priority}
                onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Task Technical Notes</label>
            <textarea
              className="form-textarea"
              value={taskForm.description}
              onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
              placeholder="Action items and verification criteria..."
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Projects;
