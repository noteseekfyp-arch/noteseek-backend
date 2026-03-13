import { API_URL } from "@/config/api"
import type { Course } from "@/types/course"

export const CourseApi = {
    async getCourses(): Promise<Course[]> {
        // Mocked - to be implemented with real backend
        return []
    },

    async createCourse(data: Partial<Course>): Promise<Course> {
        // Mocked - to be implemented with real backend
        throw new Error("Not implemented")
    }
}
