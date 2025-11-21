export default function Footer() {
  return (
    <footer className="bg-[#0B0E1A] w-full shadow-sm dark:bg-gray-900">
      <div className="w-full max-w-7xl mx-auto p-4 md:py-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <a
            href="https://flowbite.com/"
            className="flex items-center mb-4 sm:mb-0 space-x-3 rtl:space-x-reverse"
          >
            <img src="Logo.png" className="h-8" alt="Lessonly Logo" />
            <span className="self-center text-2xl font-semibold text-white">
              Lessonly
            </span>
          </a>

          <ul className="flex flex-wrap items-center mb-6 text-sm font-medium text-gray-400">
            <li>
              <a href="/about" className="hover:underline me-4 md:me-6">
                About
              </a>
            </li>
            <li>
              <a href="mailto:contact.lessonly@gmail.com" className="hover:underline me-4 md:me-6">
                Mail
              </a>
            </li>
            <li>
              <a href="/contact" className="hover:underline">
                Contact
              </a>
            </li>
          </ul>
        </div>

        <hr className="my-6 border-gray-700 lg:my-8" />

        <span className="block text-sm text-gray-500 sm:text-center">
          © 2025 <a href="/hero" className="hover:underline">Lessonly™</a>. All Rights Reserved.
        </span>
      </div>
    </footer>
  );
}
