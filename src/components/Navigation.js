import logo from '../assets/logo.svg';

const Navigation = ({ account, setAccount }) => {

    const connectHandler = async () => {
        const accounts = await window.ethereum.request({method:'eth_requestAccounts'})
        setAccount(accounts[0])
    }

    return (
        <nav>
            <ul className='nav__links'>
                <li><a href='#'>Buy</a></li>
                <li><a href='#'>Rent</a></li>
                <li><a href='#'>Sell</a></li>
            </ul>
            <div className='nav__brand'>
                <img src={logo} alt="Logo"/>
                <h1>Millow</h1>
            </div>

            <button onClick={()=> account ? null : connectHandler()}  type='submit' className='nav__connect'>
                {account ? account.slice(0,6) + '...' + account.slice(38,42): 'Connect'}
            </button>
        </nav>
    )
}

export default Navigation;
