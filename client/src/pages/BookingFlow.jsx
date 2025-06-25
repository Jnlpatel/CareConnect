// client/src/pages/BookingFlow.jsx
import React, { useState, useEffect } from 'react';
import {
  Container, Card, Form, Button, Row, Col, Spinner, Alert
} from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../utils/api';

const BookingFlow = () => {
  const { serviceId } = useParams();
  const [service, setService]             = useState(null);
  const [suggestedSlots, setSuggestedSlots] = useState([]);
  const [date, setDate]                   = useState('');
  const [slotsByDoctor, setSlotsByDoctor] = useState({});
  const [slotId, setSlotId]               = useState('');
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState('');
  const navigate = useNavigate();

  // 1) Load service metadata
  useEffect(() => {
    API.get('/services')
      .then(res => {
        const svc = res.data.find(s => s._id === serviceId);
        setService(svc);
      })
      .catch(() => setError('Failed to load service.'));
  }, [serviceId]);

  // 2) Fetch all upcoming slots once, then keep first 5
  useEffect(() => {
    if (!service) return;
    API.get(`/availability/service/${serviceId}`)
      .then(res => {
        const sorted = res.data
          .map(slot => {
            const dt = new Date(slot.date);
            const [h, m] = slot.startTime.split(':').map(Number);
            dt.setHours(h, m, 0, 0);
            return { ...slot, datetime: dt };
          })
          .sort((a, b) => a.datetime - b.datetime);
        setSuggestedSlots(sorted);
      })
      .catch(err => {
        console.error(err);
        setError('Could not load upcoming slots.');
      });
  }, [service, serviceId]);

  // 3) Manual fetch when user picks a date
  const fetchSlots = async () => {
    if (!date) return;
    setError('');
    setSlotId('');
    setLoading(true);
    try {
      const { data } = await API.get(
        `/availability/service/${serviceId}`,
        { params: { date } }
      );
      const grouped = data.reduce((acc, slot) => {
        const doc = slot.doctorId;
        const key = doc._id;
        if (!acc[key]) {
          acc[key] = {
            doctor: doc.userId?.name || 'Unknown',
            specialty: doc.specialty || '',
            slots: []
          };
        }
        acc[key].slots.push(slot);
        return acc;
      }, {});
      setSlotsByDoctor(grouped);
      if (!Object.keys(grouped).length) {
        setError('No slots for that date.');
      }
    } catch {
      setError('Error fetching slots.');
    } finally {
      setLoading(false);
    }
  };

  // 4) Confirm booking
  const confirmBooking = async () => {
    try {
      await API.post('/appointments', { serviceId, slotId });
      navigate('/patient/dashboard');
    } catch {
      setError('Could not confirm booking.');
    }
  };

  return (
    <Container className="py-4">
      <Button variant="secondary" className="mb-3" onClick={() => navigate(-1)}>
        ← Back
      </Button>

      {!service ? (
        <Spinner />
      ) : (
        <Card className="shadow-sm p-4">
          <h4 className="mb-4">Book: {service.name}</h4>
          {error && <Alert variant="danger">{error}</Alert>}

          {/* First five upcoming slots */}
          <h6>Next Upcoming Available Slots</h6>
          <Row className="mb-4">
            {suggestedSlots.map(slot => (
              <Col xs="auto" key={slot._id} className="mb-2">
                <Button
                  variant={slotId === slot._id ? 'success' : 'outline-secondary'}
                  onClick={() => setSlotId(slot._id)}
                >
                  {slot.datetime.toLocaleDateString()}{' '}
                  {slot.datetime.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Button>
              </Col>
            ))}
            {!suggestedSlots.length && (
              <Col><small className="text-muted">No upcoming slots available.</small></Col>
            )}
          </Row>
          

          {/* Show slots grouped by doctor for the chosen date */}
          {Object.entries(slotsByDoctor).map(([docId, info]) => (
            <Card key={docId} className="mt-4">
              <Card.Header>
                Dr. {info.doctor} ({info.specialty})
              </Card.Header>
              <Card.Body>
                <Row>
                  {info.slots.map(slot => {
                    const d = new Date(slot.date);
                    const [h, m] = slot.startTime.split(':').map(Number);
                    d.setHours(h, m, 0, 0);
                    return (
                      <Col xs="auto" key={slot._id} className="mb-2">
                        <Button
                          variant={slotId === slot._id ? 'success' : 'outline-secondary'}
                          onClick={() => setSlotId(slot._id)}
                        >
                          {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Button>
                      </Col>
                    );
                  })}
                </Row>
              </Card.Body>
            </Card>
          ))}

          {/* Confirm section */}
          {slotId && (
            <Card className="mt-4 p-3">
              <h5>Confirm Booking</h5>
              <p>
                {(() => {
                  const s =
                    suggestedSlots.find(x => x._id === slotId) ||
                    Object.values(slotsByDoctor).flatMap(g => g.slots).find(x => x._id === slotId);
                  const dt = s.datetime || (() => { const d = new Date(s.date); const [h,m]=s.startTime.split(':').map(Number); d.setHours(h,m,0,0); return d; })();
                  return dt.toLocaleString();
                })()}
              </p>
              <p>Service: {service.name}</p>
              <p>Price: ${service.price}</p>
              <Button variant="primary" onClick={confirmBooking}>
                Confirm Booking
              </Button>
            </Card>
          )}
        </Card>
      )}
    </Container>
  );
};

export default BookingFlow;
