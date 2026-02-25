const TaskSkeleton = () => {
    return (
        <div className="bg-white p-4 rounded-xl shadow animate-pulse">
            <div className="flex justify-between items-center">
                <div className="space-y-2 w-2/3">
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>

                <div className="flex gap-2">
                    <div className="h-8 w-20 bg-gray-300 rounded-lg"></div>
                    <div className="h-8 w-16 bg-gray-300 rounded-lg"></div>
                    <div className="h-8 w-16 bg-gray-300 rounded-lg"></div>
                </div>
            </div>
        </div>
    );
};

export default TaskSkeleton;