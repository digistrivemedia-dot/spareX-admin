import "server-only"

import type { AdminUser } from "@/features/admin-users/types"
import { daysAgo, persistent } from "@/mocks/utils"

/** 2 Super Admins and 4 Admins (one inactive). */
export const adminUsers = persistent<AdminUser[]>("admin-users", () => [
  {
    id: "adm_ravi",
    name: "Ravi Shankar",
    email: "ravi@kannaligarage.in",
    phone: "+919845012345",
    roleId: "super-admin",
    status: "active",
    twoStepEnabled: true,
    lastLoginAt: daysAgo(0, 9, 12),
    createdAt: daysAgo(180),
  },
  {
    id: "adm_priya",
    name: "Priya Nair",
    email: "priya@kannaligarage.in",
    phone: "+919880234567",
    roleId: "super-admin",
    status: "active",
    twoStepEnabled: true,
    lastLoginAt: daysAgo(1, 18, 40),
    createdAt: daysAgo(176),
  },
  {
    id: "adm_kiran",
    name: "Kiran Gowda",
    email: "kiran@kannaligarage.in",
    phone: "+919741356789",
    roleId: "admin",
    status: "active",
    twoStepEnabled: false,
    lastLoginAt: daysAgo(0, 10, 5),
    createdAt: daysAgo(150),
  },
  {
    id: "adm_meera",
    name: "Meera Iyer",
    email: "meera@kannaligarage.in",
    phone: "+919900478901",
    roleId: "admin",
    status: "active",
    twoStepEnabled: true,
    lastLoginAt: daysAgo(2, 15, 30),
    createdAt: daysAgo(120),
  },
  {
    id: "adm_suresh",
    name: "Suresh Reddy",
    email: "suresh@kannaligarage.in",
    phone: "+919538590123",
    roleId: "admin",
    status: "active",
    twoStepEnabled: false,
    lastLoginAt: daysAgo(4, 11, 20),
    createdAt: daysAgo(95),
  },
  {
    id: "adm_ananya",
    name: "Ananya Bhat",
    email: "ananya@kannaligarage.in",
    phone: "+919611601234",
    roleId: "admin",
    status: "inactive",
    twoStepEnabled: false,
    lastLoginAt: daysAgo(40, 16, 0),
    createdAt: daysAgo(160),
  },
])
