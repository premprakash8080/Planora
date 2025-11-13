export enum ModuleType {
    Creation = 1,
    Delivery = 2
}

export enum UserStatus {
    Block = 1,
    Approved = 2,
    Deleted = 3,
    Pending = 4,
    Declined = 5,
    WaitingApproval = 6
}


export enum CreationPermissions
{
    DashboardCreation = 1,
    CourseSetup,
    ManageCourses,
    Courses,
    RoleManagement,
    NewsFeed,
    TechSupport,
}

export enum DeliveryPermissions
{
    DashboardDelivery = 8,
    DeliverySetup,
    ManageTrainerAssessor,
    ManageStudents,
    Classes,
    MarkingAndFeedback,
    StudentChat,
}