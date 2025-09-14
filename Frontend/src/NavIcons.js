import React from 'react';

function IconWrapper({ children, label }){
  return (
    <div className="icon-card" role="figure" aria-label={label}>
      <div className="icon-badge" aria-hidden="true">{children}</div>
      <div className="icon-name">{label}</div>
    </div>
  );
}

function Svg({ title, children, viewBox = '0 0 24 24' }){
  return (
    <svg width="24" height="24" viewBox={viewBox} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <title>{title}</title>
      {children}
    </svg>
  );
}

function DashboardIcon(){
  return (
    <Svg title="Dashboard">
      <path d="M3 3h8v8H3V3zm0 10h8v8H3v-8zm10-10h8v12h-8V3zm0 14h8v4h-8v-4z" fill="currentColor"/>
    </Svg>
  );
}

function SparklesIcon(){
  return (
    <Svg title="Features">
      <path d="M12 2l1.8 4.5L18 8l-4.2 1.5L12 14l-1.8-4.5L6 8l4.2-1.5L12 2zm7 6l1.2 3 2.8 1-2.8 1L19 16l-1.2-3-2.8-1 2.8-1L19 8zM4 12l1 2.5 2.5 1L5 17 4 19.5 3 17l-2.5-1L3 14.5 4 12z" fill="currentColor"/>
    </Svg>
  );
}

function BookIcon(){
  return (
    <Svg title="Resources">
      <path d="M4 4h10a3 3 0 013 3v13a2 2 0 00-2-2H5a1 1 0 00-1 1V4z" fill="currentColor" opacity=".2"/>
      <path d="M4 4h10a3 3 0 013 3v13M4 18a1 1 0 011-1h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </Svg>
  );
}

function MailIcon(){
  return (
    <Svg title="Contact">
      <path d="M3 6h18v12H3z" stroke="currentColor" strokeWidth="2"/>
      <path d="M3 6l9 7 9-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </Svg>
  );
}

function KeyIcon(){
  return (
    <Svg title="Login">
      <circle cx="9" cy="12" r="4" stroke="currentColor" strokeWidth="2"/>
      <path d="M13 12h8m-4 0v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </Svg>
  );
}

function UserPlusIcon(){
  return (
    <Svg title="Register">
      <circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="2"/>
      <path d="M5 20a7 7 0 0114 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M20 8v4m2-2h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </Svg>
  );
}

const ICONS = [
  { name: 'Dashboard', Component: DashboardIcon },
  { name: 'Features', Component: SparklesIcon },
  { name: 'Resources', Component: BookIcon },
  { name: 'Contact', Component: MailIcon },
  { name: 'Login', Component: KeyIcon },
  { name: 'Register', Component: UserPlusIcon },
];

export default function NavIcons(){
  return (
    <div className="container icons-page">
      <h2 className="section-title">Navigation Icons</h2>
      <p className="section-sub">Use these consistent, accessible SVG icons in your nav and UI.</p>
      <div className="icons-grid">
        {ICONS.map(({ name, Component }) => (
          <IconWrapper key={name} label={name}>
            <Component />
          </IconWrapper>
        ))}
      </div>
    </div>
  );
}


