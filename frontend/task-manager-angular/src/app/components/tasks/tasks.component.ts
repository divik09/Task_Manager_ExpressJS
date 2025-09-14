import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { AuthService } from '../../services/auth.service';
import { Task, CreateTaskRequest, UpdateTaskRequest, TaskStatus, TaskPriority } from '../../models/task.model';
import { User } from '../../models/user.model';

interface TaskFilter {
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedTo?: string;
  search?: string;
}

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container-fluid mt-4">
      <!-- Header -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center">
            <h1 class="h3 mb-0">Task Management</h1>
            <button class="btn btn-primary" (click)="openCreateTaskModal()">
              <i class="fas fa-plus me-2"></i>
              New Task
            </button>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="card">
            <div class="card-body">
              <form [formGroup]="filterForm" class="row g-3">
                <div class="col-md-3">
                  <label for="search" class="form-label">Search</label>
                  <input
                    type="text"
                    class="form-control"
                    id="search"
                    formControlName="search"
                    placeholder="Search tasks..."
                    (input)="applyFilters()"
                  >
                </div>
                <div class="col-md-3">
                  <label for="status" class="form-label">Status</label>
                  <select
                    class="form-select"
                    id="status"
                    formControlName="status"
                    (change)="applyFilters()"
                  >
                    <option value="">All Statuses</option>
                    <option [value]="TaskStatus.TODO">To Do</option>
                    <option [value]="TaskStatus.IN_PROGRESS">In Progress</option>
                    <option [value]="TaskStatus.DONE">Done</option>
                  </select>
                </div>
                <div class="col-md-3">
                  <label for="priority" class="form-label">Priority</label>
                  <select
                    class="form-select"
                    id="priority"
                    formControlName="priority"
                    (change)="applyFilters()"
                  >
                    <option value="">All Priorities</option>
                    <option [value]="TaskPriority.HIGH">High</option>
                    <option [value]="TaskPriority.MEDIUM">Medium</option>
                    <option [value]="TaskPriority.LOW">Low</option>
                  </select>
                </div>
                <div class="col-md-3">
                  <label for="assignedTo" class="form-label">Assigned To</label>
                  <input
                    type="text"
                    class="form-control"
                    id="assignedTo"
                    formControlName="assignedTo"
                    placeholder="User email"
                    (input)="applyFilters()"
                  >
                </div>
              </form>
              <div class="mt-3">
                <button class="btn btn-outline-secondary" (click)="clearFilters()">
                  <i class="fas fa-times me-2"></i>
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tasks List -->
      <div class="row">
        <div class="col-12">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h6 class="m-0">
                Tasks ({{ filteredTasks.length }})
              </h6>
              <div class="btn-group" role="group">
                <button
                  type="button"
                  class="btn"
                  [class.btn-primary]="viewMode === 'list'"
                  [class.btn-outline-primary]="viewMode !== 'list'"
                  (click)="setViewMode('list')"
                >
                  <i class="fas fa-list"></i>
                </button>
                <button
                  type="button"
                  class="btn"
                  [class.btn-primary]="viewMode === 'kanban'"
                  [class.btn-outline-primary]="viewMode !== 'kanban'"
                  (click)="setViewMode('kanban')"
                >
                  <i class="fas fa-columns"></i>
                </button>
              </div>
            </div>
            <div class="card-body">
              <!-- Loading Spinner -->
              <div *ngIf="loading" class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              </div>

              <!-- Empty State -->
              <div *ngIf="!loading && filteredTasks.length === 0" class="text-center py-5">
                <i class="fas fa-clipboard-list fa-4x text-gray-300 mb-3"></i>
                <h5>No tasks found</h5>
                <p class="text-muted">Create your first task or adjust your filters.</p>
                <button class="btn btn-primary" (click)="openCreateTaskModal()">
                  <i class="fas fa-plus me-2"></i>
                  Create Task
                </button>
              </div>

              <!-- List View -->
              <div *ngIf="!loading && filteredTasks.length > 0 && viewMode === 'list'">
                <div class="table-responsive">
                  <table class="table table-hover">
                    <thead>
                      <tr>
                        <th>Task</th>
                        <th>Status</th>
                        <th>Priority</th>
                        <th>Assigned To</th>
                        <th>Due Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let task of filteredTasks" [class.table-warning]="isOverdue(task.dueDate)">
                        <td>
                          <div>
                            <h6 class="mb-1">{{ task.title }}</h6>
                            <small class="text-muted">{{ task.description | slice:0:100 }}{{ task.description.length > 100 ? '...' : '' }}</small>
                            <div *ngIf="task.tags.length > 0" class="mt-1">
                              <span *ngFor="let tag of task.tags" class="badge bg-light text-dark me-1">{{ tag }}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span [class]="getStatusBadgeClass(task.status)">
                            {{ getStatusDisplay(task.status) }}
                          </span>
                        </td>
                        <td>
                          <span [class]="getPriorityBadgeClass(task.priority)">
                            {{ getPriorityDisplay(task.priority) }}
                          </span>
                        </td>
                        <td>{{ task.assignedTo }}</td>
                        <td>
                          <span [class.text-danger]="isOverdue(task.dueDate)">
                            {{ task.dueDate | date:'short' }}
                          </span>
                        </td>
                        <td>
                          <div class="btn-group" role="group">
                            <button
                              class="btn btn-sm btn-outline-primary"
                              (click)="viewTask(task)"
                              title="View Details"
                            >
                              <i class="fas fa-eye"></i>
                            </button>
                            <button
                              class="btn btn-sm btn-outline-secondary"
                              (click)="editTask(task)"
                              title="Edit Task"
                            >
                              <i class="fas fa-edit"></i>
                            </button>
                            <button
                              class="btn btn-sm btn-outline-danger"
                              (click)="deleteTask(task.id)"
                              title="Delete Task"
                            >
                              <i class="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Kanban View -->
              <div *ngIf="!loading && filteredTasks.length > 0 && viewMode === 'kanban'" class="row">
                <div class="col-md-4">
                  <div class="card bg-light">
                    <div class="card-header">
                      <h6 class="m-0 text-secondary">
                        <i class="fas fa-circle text-secondary me-2"></i>
                        To Do ({{ getTasksByStatus(TaskStatus.TODO).length }})
                      </h6>
                    </div>
                    <div class="card-body p-2">
                      <div
                        *ngFor="let task of getTasksByStatus(TaskStatus.TODO)"
                        class="card mb-2"
                        [class.border-warning]="isOverdue(task.dueDate)"
                      >
                        <div class="card-body p-3">
                          <h6 class="card-title">{{ task.title }}</h6>
                          <p class="card-text small">{{ task.description | slice:0:60 }}{{ task.description.length > 60 ? '...' : '' }}</p>
                          <div class="d-flex justify-content-between align-items-center">
                            <span [class]="getPriorityBadgeClass(task.priority) + ' small'">
                              {{ getPriorityDisplay(task.priority) }}
                            </span>
                            <small [class.text-danger]="isOverdue(task.dueDate)">
                              {{ task.dueDate | date:'MMM d' }}
                            </small>
                          </div>
                          <div class="mt-2">
                            <button
                              class="btn btn-sm btn-outline-primary me-1"
                              (click)="updateTaskStatus(task.id, TaskStatus.IN_PROGRESS)"
                            >
                              Start
                            </button>
                            <button
                              class="btn btn-sm btn-outline-secondary"
                              (click)="editTask(task)"
                            >
                              <i class="fas fa-edit"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="col-md-4">
                  <div class="card bg-light">
                    <div class="card-header">
                      <h6 class="m-0 text-warning">
                        <i class="fas fa-circle text-warning me-2"></i>
                        In Progress ({{ getTasksByStatus(TaskStatus.IN_PROGRESS).length }})
                      </h6>
                    </div>
                    <div class="card-body p-2">
                      <div
                        *ngFor="let task of getTasksByStatus(TaskStatus.IN_PROGRESS)"
                        class="card mb-2"
                        [class.border-warning]="isOverdue(task.dueDate)"
                      >
                        <div class="card-body p-3">
                          <h6 class="card-title">{{ task.title }}</h6>
                          <p class="card-text small">{{ task.description | slice:0:60 }}{{ task.description.length > 60 ? '...' : '' }}</p>
                          <div class="d-flex justify-content-between align-items-center">
                            <span [class]="getPriorityBadgeClass(task.priority) + ' small'">
                              {{ getPriorityDisplay(task.priority) }}
                            </span>
                            <small [class.text-danger]="isOverdue(task.dueDate)">
                              {{ task.dueDate | date:'MMM d' }}
                            </small>
                          </div>
                          <div class="mt-2">
                            <button
                              class="btn btn-sm btn-outline-success me-1"
                              (click)="updateTaskStatus(task.id, TaskStatus.DONE)"
                            >
                              Complete
                            </button>
                            <button
                              class="btn btn-sm btn-outline-secondary"
                              (click)="editTask(task)"
                            >
                              <i class="fas fa-edit"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="col-md-4">
                  <div class="card bg-light">
                    <div class="card-header">
                      <h6 class="m-0 text-success">
                        <i class="fas fa-circle text-success me-2"></i>
                        Done ({{ getTasksByStatus(TaskStatus.DONE).length }})
                      </h6>
                    </div>
                    <div class="card-body p-2">
                      <div
                        *ngFor="let task of getTasksByStatus(TaskStatus.DONE)"
                        class="card mb-2"
                      >
                        <div class="card-body p-3">
                          <h6 class="card-title">{{ task.title }}</h6>
                          <p class="card-text small">{{ task.description | slice:0:60 }}{{ task.description.length > 60 ? '...' : '' }}</p>
                          <div class="d-flex justify-content-between align-items-center">
                            <span [class]="getPriorityBadgeClass(task.priority) + ' small'">
                              {{ getPriorityDisplay(task.priority) }}
                            </span>
                            <small class="text-muted">
                              {{ task.dueDate | date:'MMM d' }}
                            </small>
                          </div>
                          <div class="mt-2">
                            <button
                              class="btn btn-sm btn-outline-secondary"
                              (click)="editTask(task)"
                            >
                              <i class="fas fa-edit"></i>
                            </button>
                            <button
                              class="btn btn-sm btn-outline-warning ms-1"
                              (click)="updateTaskStatus(task.id, TaskStatus.TODO)"
                            >
                              Reopen
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Task Modal -->
    <div class="modal fade" id="taskModal" tabindex="-1" *ngIf="showModal">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              {{ isEditing ? 'Edit Task' : 'Create New Task' }}
            </h5>
            <button type="button" class="btn-close" (click)="closeModal()"></button>
          </div>
          <div class="modal-body">
            <form [formGroup]="taskForm" (ngSubmit)="saveTask()">
              <div class="row">
                <div class="col-12 mb-3">
                  <label for="title" class="form-label">Title</label>
                  <input
                    type="text"
                    class="form-control"
                    id="title"
                    formControlName="title"
                    [class.is-invalid]="taskForm.get('title')?.invalid && taskForm.get('title')?.touched"
                  >
                  <div class="invalid-feedback" *ngIf="taskForm.get('title')?.invalid && taskForm.get('title')?.touched">
                    Title is required.
                  </div>
                </div>

                <div class="col-12 mb-3">
                  <label for="description" class="form-label">Description</label>
                  <textarea
                    class="form-control"
                    id="description"
                    rows="3"
                    formControlName="description"
                    [class.is-invalid]="taskForm.get('description')?.invalid && taskForm.get('description')?.touched"
                  ></textarea>
                  <div class="invalid-feedback" *ngIf="taskForm.get('description')?.invalid && taskForm.get('description')?.touched">
                    Description is required.
                  </div>
                </div>

                <div class="col-md-6 mb-3">
                  <label for="priority" class="form-label">Priority</label>
                  <select
                    class="form-select"
                    id="priority"
                    formControlName="priority"
                    [class.is-invalid]="taskForm.get('priority')?.invalid && taskForm.get('priority')?.touched"
                  >
                    <option value="">Select Priority</option>
                    <option [value]="TaskPriority.HIGH">High</option>
                    <option [value]="TaskPriority.MEDIUM">Medium</option>
                    <option [value]="TaskPriority.LOW">Low</option>
                  </select>
                  <div class="invalid-feedback" *ngIf="taskForm.get('priority')?.invalid && taskForm.get('priority')?.touched">
                    Priority is required.
                  </div>
                </div>

                <div class="col-md-6 mb-3" *ngIf="isEditing">
                  <label for="status" class="form-label">Status</label>
                  <select
                    class="form-select"
                    id="status"
                    formControlName="status"
                  >
                    <option [value]="TaskStatus.TODO">To Do</option>
                    <option [value]="TaskStatus.IN_PROGRESS">In Progress</option>
                    <option [value]="TaskStatus.DONE">Done</option>
                  </select>
                </div>

                <div class="col-12 mb-3">
                  <label for="assignedTo" class="form-label">Assigned To</label>
                  <input
                    type="email"
                    class="form-control"
                    id="assignedTo"
                    formControlName="assignedTo"
                    placeholder="user@example.com"
                    [class.is-invalid]="taskForm.get('assignedTo')?.invalid && taskForm.get('assignedTo')?.touched"
                  >
                  <div class="invalid-feedback" *ngIf="taskForm.get('assignedTo')?.invalid && taskForm.get('assignedTo')?.touched">
                    Please enter a valid email address.
                  </div>
                </div>

                <div class="col-12 mb-3">
                  <label for="dueDate" class="form-label">Due Date</label>
                  <input
                    type="datetime-local"
                    class="form-control"
                    id="dueDate"
                    formControlName="dueDate"
                    [class.is-invalid]="taskForm.get('dueDate')?.invalid && taskForm.get('dueDate')?.touched"
                  >
                  <div class="invalid-feedback" *ngIf="taskForm.get('dueDate')?.invalid && taskForm.get('dueDate')?.touched">
                    Due date is required.
                  </div>
                </div>

                <div class="col-12 mb-3">
                  <label for="tags" class="form-label">Tags</label>
                  <input
                    type="text"
                    class="form-control"
                    id="tags"
                    formControlName="tags"
                    placeholder="Enter tags separated by commas (e.g., urgent, frontend, bug-fix)"
                  >
                  <div class="form-text">Separate multiple tags with commas</div>
                </div>
              </div>

              <div class="alert alert-danger" *ngIf="modalError">
                {{ modalError }}
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="closeModal()">
              Cancel
            </button>
            <button
              type="button"
              class="btn btn-primary"
              [disabled]="taskForm.invalid || modalLoading"
              (click)="saveTask()"
            >
              <span class="spinner-border spinner-border-sm me-2" *ngIf="modalLoading"></span>
              {{ modalLoading ? 'Saving...' : (isEditing ? 'Update Task' : 'Create Task') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Backdrop -->
    <div class="modal-backdrop fade show" *ngIf="showModal" (click)="closeModal()"></div>
  `
})
export class TasksComponent implements OnInit {
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  loading = true;
  viewMode: 'list' | 'kanban' = 'list';

  filterForm: FormGroup;
  taskForm: FormGroup;

  showModal = false;
  isEditing = false;
  editingTaskId: string | null = null;
  modalLoading = false;
  modalError = '';

  currentUser: User | null = null;

  // Enums for template
  TaskStatus = TaskStatus;
  TaskPriority = TaskPriority;

  constructor(
    private taskService: TaskService,
    private authService: AuthService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.filterForm = this.fb.group({
      search: [''],
      status: [''],
      priority: [''],
      assignedTo: ['']
    });

    this.taskForm = this.fb.group({
      title: ['', [Validators.required]],
      description: ['', [Validators.required]],
      priority: ['', [Validators.required]],
      status: [TaskStatus.TODO],
      assignedTo: ['', [Validators.required, Validators.email]],
      dueDate: ['', [Validators.required]],
      tags: ['']
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadTasks();
    this.setupQueryParams();
  }

  setupQueryParams(): void {
    this.route.queryParams.subscribe(params => {
      if (params['status']) {
        this.filterForm.patchValue({ status: params['status'] });
      }
      if (params['view']) {
        // If there's a specific task to view, we might implement a detail view
      }
      this.applyFilters();
    });
  }

  loadTasks(): void {
    this.loading = true;
    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    const filters = this.filterForm.value;
    this.filteredTasks = this.tasks.filter(task => {
      const matchesSearch = !filters.search ||
        task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        task.description.toLowerCase().includes(filters.search.toLowerCase());

      const matchesStatus = !filters.status || task.status === filters.status;
      const matchesPriority = !filters.priority || task.priority === filters.priority;
      const matchesAssignedTo = !filters.assignedTo ||
        task.assignedTo.toLowerCase().includes(filters.assignedTo.toLowerCase());

      return matchesSearch && matchesStatus && matchesPriority && matchesAssignedTo;
    });
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.applyFilters();
  }

  setViewMode(mode: 'list' | 'kanban'): void {
    this.viewMode = mode;
  }

  getTasksByStatus(status: TaskStatus): Task[] {
    return this.filteredTasks.filter(task => task.status === status);
  }

  openCreateTaskModal(): void {
    this.isEditing = false;
    this.editingTaskId = null;
    this.taskForm.reset({
      status: TaskStatus.TODO,
      assignedTo: this.currentUser?.email || ''
    });
    this.showModal = true;
    this.modalError = '';
  }

  editTask(task: Task): void {
    this.isEditing = true;
    this.editingTaskId = task.id;

    // Format date for datetime-local input
    const dueDate = new Date(task.dueDate);
    const formattedDate = dueDate.toISOString().slice(0, 16);

    this.taskForm.patchValue({
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      assignedTo: task.assignedTo,
      dueDate: formattedDate,
      tags: task.tags.join(', ')
    });

    this.showModal = true;
    this.modalError = '';
  }

  viewTask(task: Task): void {
    // For now, just edit the task. In a real app, you might have a separate view modal
    this.editTask(task);
  }

  closeModal(): void {
    this.showModal = false;
    this.taskForm.reset();
    this.modalError = '';
  }

  saveTask(): void {
    if (this.taskForm.valid) {
      this.modalLoading = true;
      this.modalError = '';

      const formValue = this.taskForm.value;
      const tags = formValue.tags ? formValue.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag) : [];

      if (this.isEditing && this.editingTaskId) {
        const updateRequest: UpdateTaskRequest = {
          title: formValue.title,
          description: formValue.description,
          priority: formValue.priority,
          status: formValue.status,
          assignedTo: formValue.assignedTo,
          dueDate: new Date(formValue.dueDate),
          tags: tags
        };

        this.taskService.updateTask(this.editingTaskId, updateRequest).subscribe({
          next: (updatedTask) => {
            const index = this.tasks.findIndex(t => t.id === this.editingTaskId);
            if (index !== -1) {
              this.tasks[index] = updatedTask;
            }
            this.applyFilters();
            this.closeModal();
            this.modalLoading = false;
          },
          error: (error) => {
            this.modalError = error.error?.message || 'Failed to update task';
            this.modalLoading = false;
          }
        });
      } else {
        const createRequest: CreateTaskRequest = {
          title: formValue.title,
          description: formValue.description,
          priority: formValue.priority,
          assignedTo: formValue.assignedTo,
          dueDate: new Date(formValue.dueDate),
          tags: tags
        };

        this.taskService.createTask(createRequest).subscribe({
          next: (newTask) => {
            this.tasks.unshift(newTask);
            this.applyFilters();
            this.closeModal();
            this.modalLoading = false;
          },
          error: (error) => {
            this.modalError = error.error?.message || 'Failed to create task';
            this.modalLoading = false;
          }
        });
      }
    }
  }

  updateTaskStatus(taskId: string, newStatus: TaskStatus): void {
    this.taskService.updateTaskStatus(taskId, newStatus).subscribe({
      next: (updatedTask) => {
        const index = this.tasks.findIndex(t => t.id === taskId);
        if (index !== -1) {
          this.tasks[index] = updatedTask;
        }
        this.applyFilters();
      },
      error: (error) => {
        console.error('Error updating task status:', error);
      }
    });
  }

  deleteTask(taskId: string): void {
    if (confirm('Are you sure you want to delete this task?')) {
      this.taskService.deleteTask(taskId).subscribe({
        next: () => {
          this.tasks = this.tasks.filter(t => t.id !== taskId);
          this.applyFilters();
        },
        error: (error) => {
          console.error('Error deleting task:', error);
        }
      });
    }
  }

  getStatusBadgeClass(status: TaskStatus): string {
    switch (status) {
      case TaskStatus.TODO:
        return 'badge bg-secondary';
      case TaskStatus.IN_PROGRESS:
        return 'badge bg-warning';
      case TaskStatus.DONE:
        return 'badge bg-success';
      default:
        return 'badge bg-light';
    }
  }

  getPriorityBadgeClass(priority: TaskPriority): string {
    switch (priority) {
      case TaskPriority.HIGH:
        return 'badge bg-danger';
      case TaskPriority.MEDIUM:
        return 'badge bg-warning';
      case TaskPriority.LOW:
        return 'badge bg-success';
      default:
        return 'badge bg-light';
    }
  }

  getStatusDisplay(status: TaskStatus): string {
    switch (status) {
      case TaskStatus.TODO:
        return 'To Do';
      case TaskStatus.IN_PROGRESS:
        return 'In Progress';
      case TaskStatus.DONE:
        return 'Done';
      default:
        return status;
    }
  }

  getPriorityDisplay(priority: TaskPriority): string {
    switch (priority) {
      case TaskPriority.HIGH:
        return 'High';
      case TaskPriority.MEDIUM:
        return 'Medium';
      case TaskPriority.LOW:
        return 'Low';
      default:
        return priority;
    }
  }

  isOverdue(dueDate: Date): boolean {
    return new Date(dueDate) < new Date();
  }
}