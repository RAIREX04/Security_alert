IF DB_ID(N'ManagementEmergency') IS NULL
BEGIN
    CREATE DATABASE [ManagementEmergency];
END
GO

USE [ManagementEmergency];
GO

SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID(N'dbo.roles', N'U') IS NULL
BEGIN
CREATE TABLE dbo.roles (
    role_id INT IDENTITY(1,1) NOT NULL,
    role_name NVARCHAR(50) NOT NULL,
    description NVARCHAR(255) NULL,
    CONSTRAINT PK_roles PRIMARY KEY CLUSTERED (role_id),
    CONSTRAINT UX_roles_role_name UNIQUE (role_name)
);
END
GO

IF OBJECT_ID(N'dbo.departments', N'U') IS NULL
BEGIN
CREATE TABLE dbo.departments (
    department_id INT IDENTITY(1,1) NOT NULL,
    department_code NVARCHAR(100) NOT NULL,
    department_name NVARCHAR(150) NOT NULL,
    description NVARCHAR(MAX) NULL,
    icon NVARCHAR(100) NULL,
    color NVARCHAR(20) NULL,
    is_active BIT NOT NULL CONSTRAINT DF_departments_is_active DEFAULT (1),
    CONSTRAINT PK_departments PRIMARY KEY CLUSTERED (department_id),
    CONSTRAINT UX_departments_department_code UNIQUE (department_code)
);
END
GO

IF OBJECT_ID(N'dbo.users', N'U') IS NULL
BEGIN
CREATE TABLE dbo.users (
    user_id INT IDENTITY(1,1) NOT NULL,
    role_id INT NOT NULL,
    department_id INT NULL,
    full_name NVARCHAR(150) NOT NULL,
    username NVARCHAR(100) NOT NULL,
    email NVARCHAR(150) NOT NULL,
    password_hash NVARCHAR(255) NOT NULL,
    phone_number NVARCHAR(50) NULL,
    photo_url NVARCHAR(500) NULL,
    approval_status NVARCHAR(20) NOT NULL CONSTRAINT DF_users_approval_status DEFAULT ('approved'),
    approved_by_user_id INT NULL,
    approved_at DATETIME2(0) NULL,
    is_active BIT NOT NULL CONSTRAINT DF_users_is_active DEFAULT (1),
    last_login_at DATETIME2(0) NULL,
    created_at DATETIME2(0) NOT NULL CONSTRAINT DF_users_created_at DEFAULT (SYSUTCDATETIME()),
    updated_at DATETIME2(0) NOT NULL CONSTRAINT DF_users_updated_at DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT PK_users PRIMARY KEY CLUSTERED (user_id),
    CONSTRAINT UX_users_username UNIQUE (username),
    CONSTRAINT UX_users_email UNIQUE (email),
    CONSTRAINT CK_users_approval_status CHECK (approval_status IN ('pending', 'approved', 'rejected')),
    CONSTRAINT FK_users_roles FOREIGN KEY (role_id) REFERENCES dbo.roles(role_id),
    CONSTRAINT FK_users_departments FOREIGN KEY (department_id) REFERENCES dbo.departments(department_id),
    CONSTRAINT FK_users_approved_by FOREIGN KEY (approved_by_user_id) REFERENCES dbo.users(user_id)
);
END
GO

IF OBJECT_ID(N'dbo.refresh_tokens', N'U') IS NULL
BEGIN
CREATE TABLE dbo.refresh_tokens (
    refresh_token_id INT IDENTITY(1,1) NOT NULL,
    user_id INT NOT NULL,
    token_hash NVARCHAR(255) NOT NULL,
    expires_at DATETIME2(0) NOT NULL,
    revoked_at DATETIME2(0) NULL,
    created_at DATETIME2(0) NOT NULL CONSTRAINT DF_refresh_tokens_created_at DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT PK_refresh_tokens PRIMARY KEY CLUSTERED (refresh_token_id),
    CONSTRAINT UX_refresh_tokens_token_hash UNIQUE (token_hash),
    CONSTRAINT FK_refresh_tokens_users FOREIGN KEY (user_id) REFERENCES dbo.users(user_id) ON DELETE CASCADE
);
END
GO

IF OBJECT_ID(N'dbo.user_tokens', N'U') IS NULL
BEGIN
CREATE TABLE dbo.user_tokens (
    token_id INT IDENTITY(1,1) NOT NULL,
    user_id INT NOT NULL,
    platform NVARCHAR(10) NOT NULL,
    fcm_token NVARCHAR(500) NOT NULL,
    device_id NVARCHAR(255) NULL,
    last_seen_at DATETIME2(0) NULL,
    created_at DATETIME2(0) NOT NULL CONSTRAINT DF_user_tokens_created_at DEFAULT (SYSUTCDATETIME()),
    updated_at DATETIME2(0) NOT NULL CONSTRAINT DF_user_tokens_updated_at DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT PK_user_tokens PRIMARY KEY CLUSTERED (token_id),
    CONSTRAINT UX_user_tokens_fcm_token UNIQUE (fcm_token),
    CONSTRAINT CK_user_tokens_platform CHECK (platform = 'android'),
    CONSTRAINT FK_user_tokens_users FOREIGN KEY (user_id) REFERENCES dbo.users(user_id) ON DELETE CASCADE
);
END
GO

IF OBJECT_ID(N'dbo.reports', N'U') IS NULL
BEGIN
CREATE TABLE dbo.reports (
    report_id INT IDENTITY(1,1) NOT NULL,
    department_id INT NOT NULL,
    reporter_user_id INT NOT NULL,
    source_department_id INT NULL,
    assigned_staff_id INT NULL,
    description NVARCHAR(MAX) NOT NULL,
    incident_location_text NVARCHAR(255) NOT NULL,
    incident_latitude DECIMAL(10,7) NULL,
    incident_longitude DECIMAL(10,7) NULL,
    status NVARCHAR(20) NOT NULL CONSTRAINT DF_reports_status DEFAULT ('open'),
    progress_started_at DATETIME2(0) NULL,
    arrived_at DATETIME2(0) NULL,
    arrived_location_text NVARCHAR(255) NULL,
    completed_at DATETIME2(0) NULL,
    completed_location_text NVARCHAR(255) NULL,
    resolution_minutes INT NULL,
    completion_description NVARCHAR(MAX) NULL,
    rating_score INT NULL,
    rating_comment NVARCHAR(MAX) NULL,
    rated_at DATETIME2(0) NULL,
    requester_rating_score INT NULL,
    requester_rating_comment NVARCHAR(MAX) NULL,
    requester_rated_at DATETIME2(0) NULL,
    staff_rating_score INT NULL,
    staff_rating_comment NVARCHAR(MAX) NULL,
    staff_rated_at DATETIME2(0) NULL,
    created_at DATETIME2(0) NOT NULL CONSTRAINT DF_reports_created_at DEFAULT (SYSUTCDATETIME()),
    updated_at DATETIME2(0) NOT NULL CONSTRAINT DF_reports_updated_at DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT PK_reports PRIMARY KEY CLUSTERED (report_id),
    CONSTRAINT CK_reports_status CHECK (status IN ('open', 'progress', 'close')),
    CONSTRAINT CK_reports_rating_score CHECK (rating_score IS NULL OR (rating_score BETWEEN 1 AND 5)),
    CONSTRAINT FK_reports_departments FOREIGN KEY (department_id) REFERENCES dbo.departments(department_id),
    CONSTRAINT FK_reports_reporter_users FOREIGN KEY (reporter_user_id) REFERENCES dbo.users(user_id),
    CONSTRAINT FK_reports_source_departments FOREIGN KEY (source_department_id) REFERENCES dbo.departments(department_id),
    CONSTRAINT FK_reports_assigned_staff FOREIGN KEY (assigned_staff_id) REFERENCES dbo.users(user_id)
);
END
GO

IF OBJECT_ID(N'dbo.report_attachments', N'U') IS NULL
BEGIN
CREATE TABLE dbo.report_attachments (
    attachment_id INT IDENTITY(1,1) NOT NULL,
    report_id INT NOT NULL,
    attachment_type NVARCHAR(30) NOT NULL,
    file_name NVARCHAR(255) NOT NULL,
    file_url NVARCHAR(500) NOT NULL,
    mime_type NVARCHAR(100) NULL,
    file_size INT NULL,
    created_at DATETIME2(0) NOT NULL CONSTRAINT DF_report_attachments_created_at DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT PK_report_attachments PRIMARY KEY CLUSTERED (attachment_id),
    CONSTRAINT CK_report_attachments_type CHECK (attachment_type IN ('incident_photo', 'completion_photo')),
    CONSTRAINT FK_report_attachments_reports FOREIGN KEY (report_id) REFERENCES dbo.reports(report_id) ON DELETE CASCADE
);
END
GO

IF OBJECT_ID(N'dbo.notification_logs', N'U') IS NULL
BEGIN
CREATE TABLE dbo.notification_logs (
    notification_log_id INT IDENTITY(1,1) NOT NULL,
    report_id INT NULL,
    target_department_id INT NOT NULL,
    notification_type NVARCHAR(50) NOT NULL,
    title NVARCHAR(255) NOT NULL,
    body NVARCHAR(MAX) NOT NULL,
    success_count INT NOT NULL CONSTRAINT DF_notification_logs_success_count DEFAULT (0),
    failure_count INT NOT NULL CONSTRAINT DF_notification_logs_failure_count DEFAULT (0),
    payload_json NVARCHAR(MAX) NULL,
    created_at DATETIME2(0) NOT NULL CONSTRAINT DF_notification_logs_created_at DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT PK_notification_logs PRIMARY KEY CLUSTERED (notification_log_id),
    CONSTRAINT FK_notification_logs_reports FOREIGN KEY (report_id) REFERENCES dbo.reports(report_id) ON DELETE SET NULL,
    CONSTRAINT FK_notification_logs_departments FOREIGN KEY (target_department_id) REFERENCES dbo.departments(department_id)
);
END
GO

IF OBJECT_ID(N'dbo.audit_logs', N'U') IS NULL
BEGIN
CREATE TABLE dbo.audit_logs (
    audit_log_id INT IDENTITY(1,1) NOT NULL,
    actor_user_id INT NULL,
    entity_type NVARCHAR(100) NOT NULL,
    entity_id NVARCHAR(100) NOT NULL,
    action NVARCHAR(100) NOT NULL,
    before_json NVARCHAR(MAX) NULL,
    after_json NVARCHAR(MAX) NULL,
    created_at DATETIME2(0) NOT NULL CONSTRAINT DF_audit_logs_created_at DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT PK_audit_logs PRIMARY KEY CLUSTERED (audit_log_id),
    CONSTRAINT FK_audit_logs_users FOREIGN KEY (actor_user_id) REFERENCES dbo.users(user_id) ON DELETE SET NULL
);
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_users_role_id' AND object_id = OBJECT_ID('dbo.users'))
    CREATE INDEX IX_users_role_id ON dbo.users (role_id);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_users_department_id' AND object_id = OBJECT_ID('dbo.users'))
    CREATE INDEX IX_users_department_id ON dbo.users (department_id);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_users_approval_status' AND object_id = OBJECT_ID('dbo.users'))
    CREATE INDEX IX_users_approval_status ON dbo.users (approval_status);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_users_is_active' AND object_id = OBJECT_ID('dbo.users'))
    CREATE INDEX IX_users_is_active ON dbo.users (is_active);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_departments_is_active' AND object_id = OBJECT_ID('dbo.departments'))
    CREATE INDEX IX_departments_is_active ON dbo.departments (is_active);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_refresh_tokens_user_id' AND object_id = OBJECT_ID('dbo.refresh_tokens'))
    CREATE INDEX IX_refresh_tokens_user_id ON dbo.refresh_tokens (user_id);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_refresh_tokens_expires_at' AND object_id = OBJECT_ID('dbo.refresh_tokens'))
    CREATE INDEX IX_refresh_tokens_expires_at ON dbo.refresh_tokens (expires_at);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_user_tokens_user_id' AND object_id = OBJECT_ID('dbo.user_tokens'))
    CREATE INDEX IX_user_tokens_user_id ON dbo.user_tokens (user_id);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_reports_department_id' AND object_id = OBJECT_ID('dbo.reports'))
    CREATE INDEX IX_reports_department_id ON dbo.reports (department_id);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_reports_reporter_user_id' AND object_id = OBJECT_ID('dbo.reports'))
    CREATE INDEX IX_reports_reporter_user_id ON dbo.reports (reporter_user_id);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_reports_assigned_staff_id' AND object_id = OBJECT_ID('dbo.reports'))
    CREATE INDEX IX_reports_assigned_staff_id ON dbo.reports (assigned_staff_id);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_reports_source_department_id' AND object_id = OBJECT_ID('dbo.reports'))
    CREATE INDEX IX_reports_source_department_id ON dbo.reports (source_department_id);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_reports_status' AND object_id = OBJECT_ID('dbo.reports'))
    CREATE INDEX IX_reports_status ON dbo.reports (status);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_reports_created_at' AND object_id = OBJECT_ID('dbo.reports'))
    CREATE INDEX IX_reports_created_at ON dbo.reports (created_at);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_reports_department_status_created_at' AND object_id = OBJECT_ID('dbo.reports'))
    CREATE INDEX IX_reports_department_status_created_at ON dbo.reports (department_id, status, created_at DESC);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_report_attachments_report_id' AND object_id = OBJECT_ID('dbo.report_attachments'))
    CREATE INDEX IX_report_attachments_report_id ON dbo.report_attachments (report_id);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_report_attachments_type' AND object_id = OBJECT_ID('dbo.report_attachments'))
    CREATE INDEX IX_report_attachments_type ON dbo.report_attachments (attachment_type);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_notification_logs_report_id' AND object_id = OBJECT_ID('dbo.notification_logs'))
    CREATE INDEX IX_notification_logs_report_id ON dbo.notification_logs (report_id);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_notification_logs_target_department_id' AND object_id = OBJECT_ID('dbo.notification_logs'))
    CREATE INDEX IX_notification_logs_target_department_id ON dbo.notification_logs (target_department_id);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_notification_logs_created_at' AND object_id = OBJECT_ID('dbo.notification_logs'))
    CREATE INDEX IX_notification_logs_created_at ON dbo.notification_logs (created_at);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_audit_logs_actor_user_id' AND object_id = OBJECT_ID('dbo.audit_logs'))
    CREATE INDEX IX_audit_logs_actor_user_id ON dbo.audit_logs (actor_user_id);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_audit_logs_entity' AND object_id = OBJECT_ID('dbo.audit_logs'))
    CREATE INDEX IX_audit_logs_entity ON dbo.audit_logs (entity_type, entity_id);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_audit_logs_created_at' AND object_id = OBJECT_ID('dbo.audit_logs'))
    CREATE INDEX IX_audit_logs_created_at ON dbo.audit_logs (created_at);
GO

IF NOT EXISTS (SELECT 1 FROM dbo.roles WHERE role_name = 'superadmin')
BEGIN
    INSERT INTO dbo.roles (role_name, description) VALUES ('superadmin', 'SUPERADMIN');
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.roles WHERE role_name = 'admin')
BEGIN
    INSERT INTO dbo.roles (role_name, description) VALUES ('admin', 'ADMIN');
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.roles WHERE role_name = 'staff')
BEGIN
    INSERT INTO dbo.roles (role_name, description) VALUES ('staff', 'STAFF');
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.roles WHERE role_name = 'user')
BEGIN
    INSERT INTO dbo.roles (role_name, description) VALUES ('user', 'USER');
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.roles WHERE role_name = 'view_only')
BEGIN
    INSERT INTO dbo.roles (role_name, description) VALUES ('view_only', 'VIEW ONLY');
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.departments WHERE department_code = 'ALERT SECURITY')
BEGIN
    INSERT INTO dbo.departments (department_code, department_name, description, icon, color, is_active)
    VALUES ('ALERT SECURITY', 'ALERT SECURITY', 'Penanganan keamanan dan gangguan kantor dan perumahan', 'shield', '#1D4ED8', 1);
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.departments WHERE department_code = 'ALERT FIRE STATION')
BEGIN
    INSERT INTO dbo.departments (department_code, department_name, description, icon, color, is_active)
    VALUES ('ALERT FIRE STATION', 'ALERT FIRE STATION', 'Penanganan kebakaran, ledakan, dan gas berbahaya', 'fire', '#DC2626', 1);
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.departments WHERE department_code = 'ALERT MEDICAL')
BEGIN
    INSERT INTO dbo.departments (department_code, department_name, description, icon, color, is_active)
    VALUES ('ALERT MEDICAL', 'ALERT MEDICAL', 'Penanganan kondisi kesehatan darurat', 'medical', '#059669', 1);
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.departments WHERE department_code = 'IT HELPDESK')
BEGIN
    INSERT INTO dbo.departments (department_code, department_name, description, icon, color, is_active)
    VALUES ('IT HELPDESK', 'IT HELPDESK', 'Penanganan gangguan IT, infrastruktur jaringan, dan aplikasi', 'computer', '#EA580C', 1);
END
GO
