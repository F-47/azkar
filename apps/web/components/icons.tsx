export const MosqueIcon = () => {
  return (
    <svg
      width="600"
      height="200"
      viewBox="0 0 600 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0 180 H600 M100 180 V120 Q120 80 150 120 V180 M450 180 V120 Q480 80 500 120 V180 M250 180 V100 Q300 40 350 100 V180"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="300" cy="80" r="20" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
};

export const GitHubIcon = () => {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      width="32"
      height="32"
      fill="currentColor"
      display="inline-block"
      overflow="visible"
    >
      <path d="M10.226 17.284c-2.965-.36-5.054-2.493-5.054-5.256 0-1.123.404-2.336 1.078-3.144-.292-.741-.247-2.314.09-2.965.898-.112 2.111.36 2.83 1.01.853-.269 1.752-.404 2.853-.404 1.1 0 1.999.135 2.807.382.696-.629 1.932-1.1 2.83-.988.315.606.36 2.179.067 2.942.72.854 1.101 2 1.101 3.167 0 2.763-2.089 4.852-5.098 5.234.763.494 1.28 1.572 1.28 2.807v2.336c0 .674.561 1.056 1.235.786 4.066-1.55 7.255-5.615 7.255-10.646C23.5 6.188 18.334 1 11.978 1 5.62 1 .5 6.188.5 12.545c0 4.986 3.167 9.12 7.435 10.669.606.225 1.19-.18 1.19-.786V20.63a2.9 2.9 0 0 1-1.078.224c-1.483 0-2.359-.808-2.987-2.313-.247-.607-.517-.966-1.034-1.033-.27-.023-.359-.135-.359-.27 0-.27.45-.471.898-.471.652 0 1.213.404 1.797 1.235.45.651.921.943 1.483.943.561 0 .92-.202 1.437-.719.382-.381.674-.718.944-.943"></path>
    </svg>
  );
};
export const AppLogo = ({ className }: { className?: string }) => {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="16" cy="16" r="16" fill="url(#logo-gradient)" />
      <path
        d="M22 11.5C22 13.9853 19.9853 16 17.5 16C15.0147 16 13 13.9853 13 11.5C13 9.01472 15.0147 7 17.5 7C19.9853 7 22 9.01472 22 11.5Z"
        fill="white"
      />
      <path
        d="M17.5 25C12.8056 25 9 21.1944 9 16.5C9 11.8056 12.8056 8 17.5 8C18.6656 8 19.761 8.23659 20.7588 8.66224C19.043 9.47954 17.8438 11.2384 17.8438 13.2812C17.8438 16.1083 20.1417 18.4062 22.9688 18.4062C23.8647 18.4062 24.7042 18.1759 25.4375 17.7719C25.1557 21.8491 21.7214 25 17.5 25Z"
        fill="white"
      />
      <defs>
        <linearGradient
          id="logo-gradient"
          x1="0"
          y1="0"
          x2="32"
          y2="32"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#3B82F6" />
          <stop offset="1" stopColor="#2DD4BF" />
        </linearGradient>
      </defs>
    </svg>
  );
};
