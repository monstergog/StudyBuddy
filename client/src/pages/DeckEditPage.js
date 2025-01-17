import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { FIND_SINGLE_DECK } from '../utils/querys';
import { ADD_CARD, EDIT_DECK } from '../utils/mutations';
import { useParams, useNavigate } from 'react-router-dom';
import DeckComponent from '../components/deck';
import styles from './DeckEditPage.module.css';

const DeckEditPage = () => {
    // Get the deckId from the URL params
    const { deckId } = useParams();
    const navigate = useNavigate();

    // Define mutation hooks for adding cards and editing the deck
    const [addCard] = useMutation(ADD_CARD);
    const [editDeck] = useMutation(EDIT_DECK);

    // Fetch data for the selected deck using useQuery
    const { loading, data } = useQuery(FIND_SINGLE_DECK, {
        variables: { deckId: deckId }
    });

    // Initialize state for deckName and description
    const [deckName, setDeckName] = useState(data?.viewDeck?.deckName || '');
    const [description, setDescription] = useState(data?.viewDeck?.description || '');
    const cards = data?.viewDeck?.cards || [];

    // Set deckName and description when data is loaded
    useEffect(() => {
        if (!loading && data) {
            setDeckName(data.viewDeck.deckName || '');
            setDescription(data.viewDeck.description || '');
        }
    }, [loading, data]);

    // Function to handle route change
    const routeChange = () => { 
        editDeck({
            variables: {
                deckId: deckId,
                updatedDeckName: deckName,
                updatedDescription: description,
            },
        });
        navigate('..', { relative: 'path'});
        window.location.reload();
    }

    // Function to handle input changes
    const handleChange = (event) => {
        const { name, value } = event.target;
        switch (name) {
            case 'deckName':
                setDeckName(value);
                break;
            case 'description':
                setDescription(value);
                break;
            default:
                break;
        }
    };

    // Function to add a new card to the deck
    const newCard = () => {
        window.scrollTo({
            top: document.documentElement.scrollHeight,
            behavior: 'smooth',
        });

        try {
            editDeck({
                variables: {
                    deckId: deckId,
                    updatedDeckName: deckName,
                    updatedDescription: description,
                },
            });
            addCard({
                variables: {
                    deckId: deckId,
                    term: '',
                    definition: '',
                },
            });
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div className={styles['card-list']}>
            <div className={styles['edit-deck']}>
                <h1>Title</h1>
                <input
                    type='text'
                    rows="2"
                    name='deckName'
                    value={deckName}
                    onChange={handleChange}
                    className={styles['card-input']}
                />

                <h2>Description</h2>
                <input
                    type='text'
                    rows="2"
                    name='description'
                    value={description}
                    onChange={handleChange}
                    className={styles['card-input']}
                />     
            </div>
            <h2>Cards</h2>
            {cards.map((card, index) => (
                <DeckComponent key={index} term={card.term} definition={card.definition} deckId={deckId} cardId={card._id} createdBy={data.viewDeck.createdBy} />
            ))}
            <button id='addCard' onClick={newCard} className={styles['card-button']}>Add New Card</button>
            <button id='finishEdit' onClick={routeChange} className={styles['card-button']}>Done Editing</button>
        </div>
    );
}

export default DeckEditPage;
