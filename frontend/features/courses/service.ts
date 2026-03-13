export const CourseService = {
    formatCourseDate(isoString: string) {
        return new Date(isoString).toLocaleDateString()
    }
}
