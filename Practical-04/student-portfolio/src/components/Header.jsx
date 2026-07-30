function Header({ name, role }) {
  return (
    <header className="header">
      <h1>{name}</h1>
      <p>{role}</p>
    </header>
  );
}

export default Header;