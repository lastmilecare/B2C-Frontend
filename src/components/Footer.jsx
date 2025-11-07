const Footer = () => {
    return (
        <footer className="bg-sky-50 border-t border-sky-100 mt-0 py-4 text-center">
            <div className="max-w-screen-xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-600">

                <div className="flex items-center gap-2">
                    <span className="text-sky-700 font-semibold">Last Mile Care</span>
                    <span className="hidden sm:inline">|</span>
                    <a
                        href="mailto:info@lastmilecare.in"
                        className="text-sky-600 hover:text-sky-800 underline underline-offset-2"
                    >
                        info@lastmilecare.in
                    </a>
                </div>

                <div className="mt-2 sm:mt-0">
                    <p className="text-gray-500">
                        © {new Date().getFullYear()} Last Mile Care Private Limited. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
