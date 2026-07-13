function Header({ name, role }) {
    return (
        <header>
            <h1>{name}</h1>
            <h3>{role}</h3>
        </header>
    );
}
export default Header;