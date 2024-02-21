import { ethers } from 'ethers';
import { useEffect, useState } from 'react';

import close from '../assets/close.svg';

const Home = ({ home, provider,account, escrow, togglePop }) => {


    const [buyer, setBuyer] = useState(null)
    const [lender, setLender] = useState(null)
    const [inspector, setInspector] = useState(null)
    const [seller, setSeller] = useState(null)
    const [hasBought, setHasBought] = useState(null)
    const [hasLended, setHasLended] = useState(null)
    const [hasSold, setHasSold] = useState(null)
    const [hasInspected, setHasInspected] = useState(null)
    const [owner, setOwner] = useState(null)


    const fetchDetails = async () => {
        // - buyer
        const buyer = await escrow.buyer(home.id)
        setBuyer(buyer)

        const hasBought = await escrow.approval(home.id, buyer)
        setHasBought(hasBought)

        const seller = await escrow.seller()
        setSeller(seller)

        const hasSold = await escrow.approval(home.id, seller)
        setHasSold(hasSold)

        const lender = await escrow.lender()
        setLender(lender)

        const hasLEnded = await escrow.approval(home.id, lender)
        setHasLended(hasLended)

        const inspector = await escrow.inspector()
        setInspector(inspector)

        const hasInspected = await escrow.inspectionPassed(home.id)
        setHasInspected(hasInspected);

    }

    const buyHandler = async () => {
        const escrowAmount = await escrow.escrowAmount(home.id)
        const signer = await provider.getSigner()
        let transaction = await escrow.connect(signer).depositEarnest(home.id,{value:escrowAmount});
        await transaction.wait()


        transaction = await escrow.connect(signer).approveSale(home.id)
        await transaction.wait()

        setHasBought(true)

    }

    const inspectHandler = async () => {
        const signer = await provider.getSigner()
        let transaction = await escrow.connect(signer).updateInspectionStatus(home.id,true);
        await transaction.wait()

        setHasInspected(true)
    }

    const lendHandler = async () => {
        const signer = await provider.getSigner()
        let transaction = await escrow.connect(signer).approveSale(home.id);
        await transaction.wait()

        const lendAmount = (await escrow.purchasePrice(home.id)) - await escrow.escrowAmount(home.id)
        await signer.sendTransaction({to:escrow.address,value:lendAmount.toString(),gasLimit:60000})

        setHasLended(true)
    }

    const sellHandler = async () => {
        const signer = await provider.getSigner()

        let transaction = await escrow.connect(signer).approveSale(home.id)
        await transaction.wait()

        transaction = await escrow.connect(signer).finalizeSale(home.id)
        await transaction.wait()

        setHasSold(true)
    }

    const fetchOwner = async () => {

        if (await escrow.isListed(home.id)) return

        const owner = await escrow.buyer(home.id)
        setOwner(owner)

    }

    useEffect(() => {
        fetchDetails()
        fetchOwner()
    }, [hasSold])

    return (
        <div className="home">
            <div className='home__details'>
                <div className='home__image'>
                    <img src={home.image} alt='home image' />

                </div>

                <div class='home__overview'>
                    <h1>{home.name}</h1>
                    <p>
                        <strong>{home.attributes[2].value}</strong> bds |
                        <strong>{home.attributes[3].value}</strong> ba |
                        <strong>{home.attributes[4].value}</strong> sqft
                    </p>
                    <p>{home.address}</p>
                    <h2>{home.attributes[0].value} ETH</h2>

                    {owner ? (<div className='home__owned'>
                        Owned by {owner.slice(0, 6) + '...' + owner.slice(38, 42)}

                    </div>) : (<div>
                        {account == inspector && (<div> 
                            <button onClick={()=>{inspectHandler()}} className='home__buy' disabled={hasInspected}>
                               Approve Inspection
                            </button>
                        </div>)}
                        {account == lender && (<div>
                            <button className='home__buy' onClick={lendHandler} disabled={hasLended}>
                                Approve & Lend
                            </button>
                        </div>)}
                        {account == seller && (<div>
                            <button className='home__buy' onClick={sellHandler} disabled={hasSold}>
                                Approve & Sell
                            </button>
                        </div>)}
                        {account != seller && account != inspector && account != lender && (<div>
                            <button className='home__buy' onClick={buyHandler} disabled={hasBought}>
                                Buy
                            </button>
                        </div>)}
                    </div>)}



                    <button className='home__contact'>
                        Contact Agent
                    </button>
                    <hr />
                    <h2>
                        Overview
                    </h2>
                    <p>
                        {home.description}
                    </p>
                    <hr />
                    <h2>
                        Facts and Features
                    </h2>
                    <ul>
                        {home.attributes.map((atr, index) => (
                            <li key={index}><strong>{atr.trait_type}</strong> : {atr.value}</li>
                        ))}
                    </ul>
                </div>
                <button onClick={togglePop} className='home__close'>
                    <img src={close} alt='close' />

                </button>

            </div>

        </div>
    );
}

export default Home;
