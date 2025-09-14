import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { AuthService } from '../../services/auth.service';
import { Task, TaskStatus, TaskPriority } from '../../models/task.model';
import { User } from '../../models/user.model';

interface TaskSummary {
  total: number;
  todo: number;
  inProgress: number;
  done: number;
  high: number;
  medium: number;
  low: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container-fluid mt-4">
      <!-- Welcome Section -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h1 class="h3 mb-2">Welcome back, {{ currentUser?.firstName }}!</h1>
              <p class="text-muted mb-0">Here's an overview of your tasks and recent activity.</p>
            </div>
            <div>
              <button class="btn btn-primary" routerLink="/tasks">
                <i class="fas fa-plus me-2"></i>
                New Task
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Task Summary Cards -->
      <div class="row mb-4">
        <div class="col-md-3 col-sm-6 mb-3">
          <div class="card border-left-primary shadow h-100 py-2">
            <div class="card-body">
              <div class="row no-gutters align-items-center">
                <div class="col mr-2">
                  <div class="text-xs font-weight-bold text-primary text-uppercase mb-1">
                    Total Tasks
                  </div>
                  <div class="h5 mb-0 font-weight-bold text-gray-800">
                    {{ taskSummary.total }}
                  </div>
                </div>
                <div class="col-auto">
                  <i class="fas fa-clipboard-list fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-3 col-sm-6 mb-3">
          <div class="card border-left-warning shadow h-100 py-2">
            <div class="card-body">
              <div class="row no-gutters align-items-center">
                <div class="col mr-2">
                  <div class="text-xs font-weight-bold text-warning text-uppercase mb-1">
                    In Progress
                  </div>
                  <div class="h5 mb-0 font-weight-bold text-gray-800">
                    {{ taskSummary.inProgress }}
                  </div>
                </div>
                <div class="col-auto">
                  <i class="fas fa-clock fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-3 col-sm-6 mb-3">
          <div class="card border-left-info shadow h-100 py-2">
            <div class="card-body">
              <div class="row no-gutters align-items-center">
                <div class="col mr-2">
                  <div class="text-xs font-weight-bold text-info text-uppercase mb-1">
                    To Do
                  </div>
                  <div class="h5 mb-0 font-weight-bold text-gray-800">
                    {{ taskSummary.todo }}
                  </div>
                </div>
                <div class="col-auto">
                  <i class="fas fa-list fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-3 col-sm-6 mb-3">
          <div class="card border-left-success shadow h-100 py-2">
            <div class="card-body">
              <div class="row no-gutters align-items-center">
                <div class="col mr-2">
                  <div class="text-xs font-weight-bold text-success text-uppercase mb-1">
                    Completed
                  </div>
                  <div class="h5 mb-0 font-weight-bold text-gray-800">
                    {{ taskSummary.done }}
                  </div>
                </div>
                <div class="col-auto">
                  <i class="fas fa-check fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Priority Overview -->
      <div class="row mb-4">
        <div class="col-lg-6 mb-4">
          <div class="card shadow">
            <div class="card-header py-3">
              <h6 class="m-0 font-weight-bold text-primary">Task Priority Overview</h6>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-4 text-center">
                  <div class="text-danger">
                    <i class="fas fa-exclamation-triangle fa-2x"></i>
                  </div>
                  <div class="mt-2">
                    <div class="text-xs font-weight-bold text-danger text-uppercase">High</div>
                    <div class="h5 mb-0 font-weight-bold">{{ taskSummary.high }}</div>
                  </div>
                </div>
                <div class="col-4 text-center">
                  <div class="text-warning">
                    <i class="fas fa-minus-circle fa-2x"></i>
                  </div>
                  <div class="mt-2">
                    <div class="text-xs font-weight-bold text-warning text-uppercase">Medium</div>
                    <div class="h5 mb-0 font-weight-bold">{{ taskSummary.medium }}</div>
                  </div>
                </div>
                <div class="col-4 text-center">
                  <div class="text-success">
                    <i class="fas fa-arrow-down fa-2x"></i>
                  </div>
                  <div class="mt-2">
                    <div class="text-xs font-weight-bold text-success text-uppercase">Low</div>
                    <div class="h5 mb-0 font-weight-bold">{{ taskSummary.low }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-lg-6 mb-4">
          <div class="card shadow">
            <div class="card-header py-3">
              <h6 class="m-0 font-weight-bold text-primary">Quick Actions</h6>
            </div>
            <div class="card-body">
              <div class="d-grid gap-2">
                <button class="btn btn-outline-primary" routerLink="/tasks">
                  <i class="fas fa-tasks me-2"></i>
                  Manage All Tasks
                </button>
                <button class="btn btn-outline-success" (click)="navigateToTasks('TODO')">
                  <i class="fas fa-plus-circle me-2"></i>
                  View Pending Tasks
                </button>
                <button class="btn btn-outline-info" routerLink="/chat">
                  <i class="fas fa-comments me-2"></i>
                  AI Assistant Chat
                </button>
                <button class="btn btn-outline-secondary" routerLink="/profile">
                  <i class="fas fa-user me-2"></i>
                  Update Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Tasks -->
      <div class="row">
        <div class="col-12">
          <div class="card shadow">
            <div class="card-header py-3 d-flex justify-content-between align-items-center">
              <h6 class="m-0 font-weight-bold text-primary">Recent Tasks</h6>
              <a routerLink="/tasks" class="btn btn-sm btn-primary">View All</a>
            </div>
            <div class="card-body">
              <div *ngIf="loading" class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              </div>

              <div *ngIf="!loading && recentTasks.length === 0" class="text-center py-4">
                <i class="fas fa-clipboard-list fa-3x text-gray-300 mb-3"></i>
                <p class="text-muted">No tasks found. Create your first task to get started!</p>
                <button class="btn btn-primary" routerLink="/tasks">
                  <i class="fas fa-plus me-2"></i>
                  Create Task
                </button>
              </div>

              <div *ngIf="!loading && recentTasks.length > 0">
                <div class="table-responsive">
                  <table class="table table-hover">
                    <thead class="table-light">
                      <tr>
                        <th>Title</th>
                        <th>Status</th>
                        <th>Priority</th>
                        <th>Due Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let task of recentTasks">
                        <td>
                          <div class="d-flex align-items-center">
                            <div>
                              <div class="font-weight-bold">{{ task.title }}</div>
                              <div class="text-muted small" *ngIf="task.description">
                                {{ task.description | slice:0:50 }}{{ task.description.length > 50 ? '...' : '' }}
                              </div>
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
                        <td>
                          <span [class]="isOverdue(task.dueDate) ? 'text-danger' : 'text-muted'">
                            {{ task.dueDate | date:'short' }}
                          </span>
                        </td>
                        <td>
                          <div class="btn-group btn-group-sm" role="group">
                            <button
                              class="btn btn-outline-primary"
                              (click)="viewTask(task.id)"
                              title="View Task">
                              <i class="fas fa-eye"></i>
                            </button>
                            <button
                              class="btn btn-outline-success"
                              *ngIf="task.status !== 'DONE'"
                              (click)="updateTaskStatus(task.id, getNextStatus(task.status))"
                              [title]="'Mark as ' + getStatusDisplay(getNextStatus(task.status))">
                              <i class="fas fa-arrow-right"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Custom CSS -->
    <style>
      .border-left-primary {
        border-left: 4px solid #4e73df !important;
      }
      .border-left-success {
        border-left: 4px solid #1cc88a !important;
      }
      .border-left-info {
        border-left: 4px solid #36b9cc !important;
      }
      .border-left-warning {
        border-left: 4px solid #f6c23e !important;
      }

      .card {
        border: none;
        border-radius: 0.375rem;
      }

      .shadow {
        box-shadow: 0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.15) !important;
      }
    </style>
  `
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  recentTasks: Task[] = [];
  loading = true;

  taskSummary: TaskSummary = {
    total: 0,
    todo: 0,
    inProgress: 0,
    done: 0,
    high: 0,
    medium: 0,
    low: 0
  };

  constructor(
    private taskService: TaskService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;

    // Load recent tasks (limit to 10)
    this.taskService.getTasks(undefined, undefined, undefined, 0, 10).subscribe({
      next: (tasks) => {
        this.recentTasks = tasks.slice(0, 5); // Show only 5 most recent
        this.calculateTaskSummary(tasks);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.loading = false;
      }
    });
  }

  calculateTaskSummary(tasks: Task[]): void {
    this.taskSummary = {
      total: tasks.length,
      todo: tasks.filter(t => t.status === TaskStatus.TODO).length,
      inProgress: tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length,
      done: tasks.filter(t => t.status === TaskStatus.DONE).length,
      high: tasks.filter(t => t.priority === TaskPriority.HIGH).length,
      medium: tasks.filter(t => t.priority === TaskPriority.MEDIUM).length,
      low: tasks.filter(t => t.priority === TaskPriority.LOW).length
    };
  }

  navigateToTasks(status?: TaskStatus): void {
    if (status) {
      this.router.navigate(['/tasks'], { queryParams: { status } });
    } else {
      this.router.navigate(['/tasks']);
    }
  }

  viewTask(taskId: string): void {
    this.router.navigate(['/tasks'], { queryParams: { view: taskId } });
  }

  updateTaskStatus(taskId: string, newStatus: TaskStatus): void {
    this.taskService.updateTaskStatus(taskId, newStatus).subscribe({
      next: (updatedTask) => {
        // Update the task in the recent tasks array
        const index = this.recentTasks.findIndex(t => t.id === taskId);
        if (index !== -1) {
          this.recentTasks[index] = updatedTask;
        }
        // Reload dashboard data to update summary
        this.loadDashboardData();
      },
      error: (error) => {
        console.error('Error updating task status:', error);
      }
    });
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

  getNextStatus(currentStatus: TaskStatus): TaskStatus {
    switch (currentStatus) {
      case TaskStatus.TODO:
        return TaskStatus.IN_PROGRESS;
      case TaskStatus.IN_PROGRESS:
        return TaskStatus.DONE;
      default:
        return currentStatus;
    }
  }

  isOverdue(dueDate: Date): boolean {
    return new Date(dueDate) < new Date();
  }
}