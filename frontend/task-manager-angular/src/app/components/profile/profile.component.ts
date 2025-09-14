import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TaskService } from '../../services/task.service';
import { User, UserRole } from '../../models/user.model';
import { Task, TaskStatus, TaskPriority } from '../../models/task.model';

interface ProfileStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container mt-4">
      <div class="row">
        <!-- Profile Information -->
        <div class="col-lg-4 mb-4">
          <div class="card shadow">
            <div class="card-body text-center">
              <div class="profile-avatar mb-3">
                <div class="avatar-large bg-primary">
                  {{ getUserInitials() }}
                </div>
              </div>
              <h4 class="mb-1">{{ currentUser?.firstName }} {{ currentUser?.lastName }}</h4>
              <p class="text-muted mb-3">{{ currentUser?.email }}</p>
              <span [class]="getRoleBadgeClass(currentUser?.role)">
                {{ getRoleDisplay(currentUser?.role) }}
              </span>
              <div class="mt-3">
                <small class="text-muted">Member since {{ currentUser?.createdAt | date:'mediumDate' }}</small>
              </div>
            </div>
          </div>

          <!-- Profile Statistics -->
          <div class="card shadow mt-4">
            <div class="card-header">
              <h6 class="m-0 font-weight-bold text-primary">
                <i class="fas fa-chart-bar me-2"></i>
                Task Statistics
              </h6>
            </div>
            <div class="card-body">
              <div *ngIf="loadingStats" class="text-center py-3">
                <div class="spinner-border spinner-border-sm text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              </div>

              <div *ngIf="!loadingStats">
                <div class="row text-center">
                  <div class="col-6 mb-3">
                    <div class="stat-item">
                      <div class="stat-number text-primary">{{ profileStats.totalTasks }}</div>
                      <div class="stat-label">Total Tasks</div>
                    </div>
                  </div>
                  <div class="col-6 mb-3">
                    <div class="stat-item">
                      <div class="stat-number text-success">{{ profileStats.completedTasks }}</div>
                      <div class="stat-label">Completed</div>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="stat-item">
                      <div class="stat-number text-warning">{{ profileStats.pendingTasks }}</div>
                      <div class="stat-label">Pending</div>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="stat-item">
                      <div class="stat-number text-danger">{{ profileStats.overdueTasks }}</div>
                      <div class="stat-label">Overdue</div>
                    </div>
                  </div>
                </div>

                <div *ngIf="profileStats.totalTasks > 0" class="mt-3">
                  <div class="progress">
                    <div
                      class="progress-bar bg-success"
                      role="progressbar"
                      [style.width.%]="getCompletionPercentage()"
                      [attr.aria-valuenow]="getCompletionPercentage()"
                      aria-valuemin="0"
                      aria-valuemax="100"
                    >
                      {{ getCompletionPercentage() }}%
                    </div>
                  </div>
                  <small class="text-muted d-block text-center mt-1">Completion Rate</small>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="card shadow mt-4">
            <div class="card-header">
              <h6 class="m-0 font-weight-bold text-primary">
                <i class="fas fa-bolt me-2"></i>
                Quick Actions
              </h6>
            </div>
            <div class="card-body">
              <div class="d-grid gap-2">
                <button class="btn btn-outline-primary btn-sm" routerLink="/tasks">
                  <i class="fas fa-tasks me-2"></i>
                  Manage Tasks
                </button>
                <button class="btn btn-outline-info btn-sm" routerLink="/chat">
                  <i class="fas fa-comments me-2"></i>
                  AI Assistant
                </button>
                <button class="btn btn-outline-secondary btn-sm" routerLink="/dashboard">
                  <i class="fas fa-tachometer-alt me-2"></i>
                  Dashboard
                </button>
                <button class="btn btn-outline-danger btn-sm" (click)="logout()">
                  <i class="fas fa-sign-out-alt me-2"></i>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Profile Settings -->
        <div class="col-lg-8">
          <div class="card shadow">
            <div class="card-header">
              <h6 class="m-0 font-weight-bold text-primary">
                <i class="fas fa-user-cog me-2"></i>
                Profile Settings
              </h6>
            </div>
            <div class="card-body">
              <!-- Profile Update Form -->
              <form [formGroup]="profileForm" (ngSubmit)="updateProfile()">
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="firstName" class="form-label">First Name</label>
                    <input
                      type="text"
                      class="form-control"
                      id="firstName"
                      formControlName="firstName"
                      [class.is-invalid]="profileForm.get('firstName')?.invalid && profileForm.get('firstName')?.touched"
                    >
                    <div class="invalid-feedback" *ngIf="profileForm.get('firstName')?.invalid && profileForm.get('firstName')?.touched">
                      <div *ngIf="profileForm.get('firstName')?.errors?.['required']">First name is required.</div>
                      <div *ngIf="profileForm.get('firstName')?.errors?.['minlength']">First name must be at least 2 characters.</div>
                    </div>
                  </div>

                  <div class="col-md-6 mb-3">
                    <label for="lastName" class="form-label">Last Name</label>
                    <input
                      type="text"
                      class="form-control"
                      id="lastName"
                      formControlName="lastName"
                      [class.is-invalid]="profileForm.get('lastName')?.invalid && profileForm.get('lastName')?.touched"
                    >
                    <div class="invalid-feedback" *ngIf="profileForm.get('lastName')?.invalid && profileForm.get('lastName')?.touched">
                      <div *ngIf="profileForm.get('lastName')?.errors?.['required']">Last name is required.</div>
                      <div *ngIf="profileForm.get('lastName')?.errors?.['minlength']">Last name must be at least 2 characters.</div>
                    </div>
                  </div>
                </div>

                <div class="mb-3">
                  <label for="email" class="form-label">Email Address</label>
                  <input
                    type="email"
                    class="form-control"
                    id="email"
                    formControlName="email"
                    [class.is-invalid]="profileForm.get('email')?.invalid && profileForm.get('email')?.touched"
                  >
                  <div class="invalid-feedback" *ngIf="profileForm.get('email')?.invalid && profileForm.get('email')?.touched">
                    Please enter a valid email address.
                  </div>
                </div>

                <div class="mb-3" *ngIf="currentUser?.role === UserRole.ADMIN">
                  <label for="role" class="form-label">Role</label>
                  <select
                    class="form-select"
                    id="role"
                    formControlName="role"
                    [class.is-invalid]="profileForm.get('role')?.invalid && profileForm.get('role')?.touched"
                  >
                    <option [value]="UserRole.USER">User</option>
                    <option [value]="UserRole.ADMIN">Admin</option>
                  </select>
                </div>

                <div class="alert alert-danger" *ngIf="profileError">
                  {{ profileError }}
                </div>

                <div class="alert alert-success" *ngIf="profileSuccess">
                  {{ profileSuccess }}
                </div>

                <button
                  type="submit"
                  class="btn btn-primary"
                  [disabled]="profileForm.invalid || profileLoading"
                >
                  <span class="spinner-border spinner-border-sm me-2" *ngIf="profileLoading"></span>
                  {{ profileLoading ? 'Updating...' : 'Update Profile' }}
                </button>
              </form>

              <hr class="my-4">

              <!-- Password Change Section -->
              <h6 class="font-weight-bold text-secondary mb-3">
                <i class="fas fa-lock me-2"></i>
                Change Password
              </h6>

              <form [formGroup]="passwordForm" (ngSubmit)="changePassword()">
                <div class="mb-3">
                  <label for="currentPassword" class="form-label">Current Password</label>
                  <input
                    type="password"
                    class="form-control"
                    id="currentPassword"
                    formControlName="currentPassword"
                    [class.is-invalid]="passwordForm.get('currentPassword')?.invalid && passwordForm.get('currentPassword')?.touched"
                  >
                  <div class="invalid-feedback" *ngIf="passwordForm.get('currentPassword')?.invalid && passwordForm.get('currentPassword')?.touched">
                    Current password is required.
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="newPassword" class="form-label">New Password</label>
                    <input
                      type="password"
                      class="form-control"
                      id="newPassword"
                      formControlName="newPassword"
                      [class.is-invalid]="passwordForm.get('newPassword')?.invalid && passwordForm.get('newPassword')?.touched"
                    >
                    <div class="invalid-feedback" *ngIf="passwordForm.get('newPassword')?.invalid && passwordForm.get('newPassword')?.touched">
                      <div *ngIf="passwordForm.get('newPassword')?.errors?.['required']">New password is required.</div>
                      <div *ngIf="passwordForm.get('newPassword')?.errors?.['minlength']">Password must be at least 6 characters.</div>
                      <div *ngIf="passwordForm.get('newPassword')?.errors?.['pattern']">Password must contain at least one letter and one number.</div>
                    </div>
                  </div>

                  <div class="col-md-6 mb-3">
                    <label for="confirmNewPassword" class="form-label">Confirm New Password</label>
                    <input
                      type="password"
                      class="form-control"
                      id="confirmNewPassword"
                      formControlName="confirmNewPassword"
                      [class.is-invalid]="passwordForm.get('confirmNewPassword')?.invalid && passwordForm.get('confirmNewPassword')?.touched"
                    >
                    <div class="invalid-feedback" *ngIf="passwordForm.get('confirmNewPassword')?.invalid && passwordForm.get('confirmNewPassword')?.touched">
                      <div *ngIf="passwordForm.get('confirmNewPassword')?.errors?.['required']">Please confirm your new password.</div>
                      <div *ngIf="passwordForm.get('confirmNewPassword')?.errors?.['passwordMismatch']">Passwords do not match.</div>
                    </div>
                  </div>
                </div>

                <div class="alert alert-danger" *ngIf="passwordError">
                  {{ passwordError }}
                </div>

                <div class="alert alert-success" *ngIf="passwordSuccess">
                  {{ passwordSuccess }}
                </div>

                <button
                  type="submit"
                  class="btn btn-warning"
                  [disabled]="passwordForm.invalid || passwordLoading"
                >
                  <span class="spinner-border spinner-border-sm me-2" *ngIf="passwordLoading"></span>
                  {{ passwordLoading ? 'Changing...' : 'Change Password' }}
                </button>
              </form>

              <hr class="my-4">

              <!-- Account Settings -->
              <h6 class="font-weight-bold text-secondary mb-3">
                <i class="fas fa-cogs me-2"></i>
                Account Settings
              </h6>

              <div class="row">
                <div class="col-md-6">
                  <div class="card bg-light">
                    <div class="card-body">
                      <h6 class="card-title">Account Information</h6>
                      <p class="card-text small">
                        <strong>Account ID:</strong> {{ currentUser?.id }}<br>
                        <strong>Member Since:</strong> {{ currentUser?.createdAt | date:'medium' }}<br>
                        <strong>Last Updated:</strong> {{ currentUser?.updatedAt | date:'medium' }}
                      </p>
                    </div>
                  </div>
                </div>

                <div class="col-md-6">
                  <div class="card bg-light">
                    <div class="card-body">
                      <h6 class="card-title">Data & Privacy</h6>
                      <div class="d-grid gap-2">
                        <button class="btn btn-outline-secondary btn-sm" (click)="exportUserData()">
                          <i class="fas fa-download me-2"></i>
                          Export Data
                        </button>
                        <button class="btn btn-outline-danger btn-sm" (click)="confirmDeleteAccount()">
                          <i class="fas fa-user-times me-2"></i>
                          Delete Account
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

    <!-- Custom Styles -->
    <style>
      .avatar-large {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 24px;
        font-weight: bold;
        margin: 0 auto;
      }

      .stat-item {
        padding: 10px 0;
      }

      .stat-number {
        font-size: 1.5rem;
        font-weight: bold;
        line-height: 1.2;
      }

      .stat-label {
        font-size: 0.8rem;
        color: #6c757d;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .card {
        border: none;
        border-radius: 0.375rem;
      }

      .shadow {
        box-shadow: 0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.15) !important;
      }

      .progress {
        height: 8px;
      }
    </style>
  `,
  imports: [CommonModule, ReactiveFormsModule]
})
export class ProfileComponent implements OnInit {
  currentUser: User | null = null;
  profileForm: FormGroup;
  passwordForm: FormGroup;

  profileLoading = false;
  passwordLoading = false;
  loadingStats = false;

  profileError = '';
  profileSuccess = '';
  passwordError = '';
  passwordSuccess = '';

  profileStats: ProfileStats = {
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0
  };

  UserRole = UserRole;

  constructor(
    private authService: AuthService,
    private taskService: TaskService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      role: ['']
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6), Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)/)]],
      confirmNewPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser) {
      this.populateProfileForm();
      this.loadProfileStats();
    } else {
      this.router.navigate(['/login']);
    }
  }

  populateProfileForm(): void {
    if (this.currentUser) {
      this.profileForm.patchValue({
        firstName: this.currentUser.firstName,
        lastName: this.currentUser.lastName,
        email: this.currentUser.email,
        role: this.currentUser.role
      });
    }
  }

  loadProfileStats(): void {
    this.loadingStats = true;
    this.taskService.getMyTasks().subscribe({
      next: (tasks) => {
        this.calculateStats(tasks);
        this.loadingStats = false;
      },
      error: (error) => {
        console.error('Error loading profile stats:', error);
        this.loadingStats = false;
      }
    });
  }

  calculateStats(tasks: Task[]): void {
    const now = new Date();

    this.profileStats = {
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.status === TaskStatus.DONE).length,
      pendingTasks: tasks.filter(t => t.status !== TaskStatus.DONE).length,
      overdueTasks: tasks.filter(t => t.status !== TaskStatus.DONE && new Date(t.dueDate) < now).length
    };
  }

  updateProfile(): void {
    if (this.profileForm.valid) {
      this.profileLoading = true;
      this.profileError = '';
      this.profileSuccess = '';

      // In a real app, you would call an API to update the profile
      // For now, we'll simulate a successful update
      setTimeout(() => {
        this.profileLoading = false;
        this.profileSuccess = 'Profile updated successfully!';

        // Update the current user data
        if (this.currentUser) {
          this.currentUser.firstName = this.profileForm.value.firstName;
          this.currentUser.lastName = this.profileForm.value.lastName;
          this.currentUser.email = this.profileForm.value.email;
          if (this.profileForm.value.role) {
            this.currentUser.role = this.profileForm.value.role;
          }
        }

        setTimeout(() => {
          this.profileSuccess = '';
        }, 5000);
      }, 1000);
    }
  }

  changePassword(): void {
    if (this.passwordForm.valid) {
      this.passwordLoading = true;
      this.passwordError = '';
      this.passwordSuccess = '';

      // In a real app, you would call an API to change the password
      setTimeout(() => {
        this.passwordLoading = false;
        this.passwordSuccess = 'Password changed successfully!';
        this.passwordForm.reset();

        setTimeout(() => {
          this.passwordSuccess = '';
        }, 5000);
      }, 1000);
    }
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmNewPassword = form.get('confirmNewPassword');

    if (!newPassword || !confirmNewPassword) {
      return null;
    }

    if (newPassword.value !== confirmNewPassword.value) {
      confirmNewPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      if (confirmNewPassword.errors) {
        delete confirmNewPassword.errors['passwordMismatch'];
        if (Object.keys(confirmNewPassword.errors).length === 0) {
          confirmNewPassword.setErrors(null);
        }
      }
      return null;
    }
  }

  logout(): void {
    if (confirm('Are you sure you want to logout?')) {
      this.authService.logout();
      this.router.navigate(['/login']);
    }
  }

  exportUserData(): void {
    if (!this.currentUser) return;

    const userData = {
      profile: this.currentUser,
      stats: this.profileStats,
      exportDate: new Date().toISOString()
    };

    const dataStr = JSON.stringify(userData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `user-data-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
  }

  confirmDeleteAccount(): void {
    const confirmed = confirm(
      'Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data.'
    );

    if (confirmed) {
      const doubleConfirm = confirm(
        'This is your final warning. Deleting your account will permanently remove all your tasks, chat history, and profile data. Type "DELETE" in the next prompt to confirm.'
      );

      if (doubleConfirm) {
        const userInput = prompt('Please type "DELETE" to confirm account deletion:');
        if (userInput === 'DELETE') {
          // In a real app, you would call an API to delete the account
          alert('Account deletion functionality would be implemented here. For security reasons, this is typically done server-side.');
        }
      }
    }
  }

  getUserInitials(): string {
    if (!this.currentUser) return 'U';
    const firstName = this.currentUser.firstName || '';
    const lastName = this.currentUser.lastName || '';
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || 'U';
  }

  getRoleBadgeClass(role?: UserRole): string {
    switch (role) {
      case UserRole.ADMIN:
        return 'badge bg-danger';
      case UserRole.USER:
        return 'badge bg-primary';
      default:
        return 'badge bg-secondary';
    }
  }

  getRoleDisplay(role?: UserRole): string {
    switch (role) {
      case UserRole.ADMIN:
        return 'Administrator';
      case UserRole.USER:
        return 'User';
      default:
        return 'Unknown';
    }
  }

  getCompletionPercentage(): number {
    if (this.profileStats.totalTasks === 0) return 0;
    return Math.round((this.profileStats.completedTasks / this.profileStats.totalTasks) * 100);
  }
}