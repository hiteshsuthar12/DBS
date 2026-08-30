import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../../context/CartContext';

const ValidateTable = () => {
    const { qrToken } = useParams();
    const navigate = useNavigate();
    const { setTableInfo } = useCart();
    const [error, setError] = useState(null);

    useEffect(() => {
        const validate = async () => {
            try {
                const res = await axios.get(`/tables/validate/${qrToken}`);
                if(res.data.success){
                    setTableInfo(res.data.data);
                    navigate('/menu');
                }
            } catch (err) {
                setError('Invalid or Inactive Table QR Code.');
            }
        };

        if (qrToken) {
            validate();
        }
    }, [qrToken, navigate, setTableInfo]);

    if (error) {
        return (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <h2 style={{ color: 'var(--danger)', marginBottom: '1rem' }}>Oops!</h2>
                <p>{error}</p>
                <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Please ask the staff for assistance.</p>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem', flexDirection: 'column', alignItems: 'center' }}>
            <div className="loader" style={{ marginBottom: '1rem' }}></div>
            <p>Identifying Table...</p>
        </div>
    );
};

export default ValidateTable;
