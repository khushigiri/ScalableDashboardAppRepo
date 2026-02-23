const AuthLayout = ({ title, subtitle, children }) => {
    return (
        <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-700">
            <div className="bg-white w-full max-w-md p-10 rounded-3xl shadow-2xl">
                <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-2">
                    {title}
                </h1>

                <p className="text-center text-gray-500 mb-8">
                    {subtitle}
                </p>

                {children}
            </div>
        </div>
    );
};

export default AuthLayout;