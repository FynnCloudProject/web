
export const useUI = () => {
    // Sidebar State
    const isSidebarOpen = useState('ui-sidebar-open', () => false)

    const toggleSidebar = () => {
        isSidebarOpen.value = !isSidebarOpen.value
    }

    const closeSidebar = () => {
        isSidebarOpen.value = false
    }

    const openSidebar = () => {
        isSidebarOpen.value = true
    }

    return {
        isSidebarOpen,
        toggleSidebar,
        closeSidebar,
        openSidebar
    }
}
