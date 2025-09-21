import { useState, useEffect, useCallback } from 'react';
import { MongoDBDataService } from '@/lib/mongodb-data';

// Custom hooks that replace Convex useQuery and useMutation

// Query hooks
export function useEvents() {
  const [events, setEvents] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    MongoDBDataService.getEvents()
      .then(setEvents)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { data: events, loading, error };
}

export function useEvent(eventId: string | null) {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!eventId) {
      setEvent(null);
      setLoading(false);
      return;
    }

    MongoDBDataService.getEventById(eventId)
      .then(setEvent)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [eventId]);

  return { data: event, loading, error };
}

export function useEventsByUserId(userId: string | null) {
  const [events, setEvents] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setEvents(null);
      setLoading(false);
      return;
    }

    MongoDBDataService.getEventsByUserId(userId)
      .then(setEvents)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [userId]);

  return { data: events, loading, error };
}

export function useEventAvailability(eventId: string | null) {
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!eventId) {
      setAvailability(null);
      setLoading(false);
      return;
    }

    MongoDBDataService.getEventAvailability(eventId)
      .then(setAvailability)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [eventId]);

  return { data: availability, loading, error };
}

export function useEventPasses(eventId: string | null) {
  const [passes, setPasses] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!eventId) {
      setPasses(null);
      setLoading(false);
      return;
    }

    MongoDBDataService.getEventPasses(eventId)
      .then(setPasses)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [eventId]);

  return { data: passes, loading, error };
}

export function usePass(passId: string | null) {
  const [pass, setPass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!passId) {
      setPass(null);
      setLoading(false);
      return;
    }

    MongoDBDataService.getPassById(passId)
      .then(setPass)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [passId]);

  return { data: pass, loading, error };
}

export function useUserTickets(userId: string | null) {
  const [tickets, setTickets] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setTickets(null);
      setLoading(false);
      return;
    }

    MongoDBDataService.getUserTickets(userId)
      .then(setTickets)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [userId]);

  return { data: tickets, loading, error };
}

export function useUserTicketsForEvent(userId: string | null, eventId: string | null) {
  const [tickets, setTickets] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId || !eventId) {
      setTickets(null);
      setLoading(false);
      return;
    }

    MongoDBDataService.getUserTicketsForEvent(userId, eventId)
      .then(setTickets)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [userId, eventId]);

  return { data: tickets, loading, error };
}

export function useTicket(ticketId: string | null) {
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!ticketId) {
      setTicket(null);
      setLoading(false);
      return;
    }

    MongoDBDataService.getTicketById(ticketId)
      .then(setTicket)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [ticketId]);

  return { data: ticket, loading, error };
}

export function useTicketWithDetails(ticketId: string | null) {
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!ticketId) {
      setTicket(null);
      setLoading(false);
      return;
    }

    MongoDBDataService.getTicketWithDetails(ticketId)
      .then(setTicket)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [ticketId]);

  return { data: ticket, loading, error };
}

export function useQueuePosition(eventId: string | null, userId: string | null) {
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!eventId || !userId) {
      setPosition(null);
      setLoading(false);
      return;
    }

    MongoDBDataService.getQueuePosition(eventId, userId)
      .then(setPosition)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [eventId, userId]);

  return { data: position, loading, error };
}

export function useUser(userId: string | null) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setUser(null);
      setLoading(false);
      return;
    }

    MongoDBDataService.getUserById(userId)
      .then(setUser)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [userId]);

  return { data: user, loading, error };
}

export function useCoupon(code: string | null) {
  const [coupon, setCoupon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!code) {
      setCoupon(null);
      setLoading(false);
      return;
    }

    MongoDBDataService.getCouponByCode(code)
      .then(setCoupon)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [code]);

  return { data: coupon, loading, error };
}

// Mutation hooks
export function useCreateEvent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (eventData: any) => {
    setLoading(true);
    setError(null);
    try {
      const result = await MongoDBDataService.createEvent(eventData);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutate, loading, error };
}

export function useUpdateEvent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (eventId: string, updateData: any) => {
    setLoading(true);
    setError(null);
    try {
      const result = await MongoDBDataService.updateEvent(eventId, updateData);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutate, loading, error };
}

export function useCancelEvent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (eventId: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await MongoDBDataService.updateEvent(eventId, { is_cancelled: true });
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutate, loading, error };
}

export function useCreatePass() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (passData: any) => {
    setLoading(true);
    setError(null);
    try {
      const result = await MongoDBDataService.createPass(passData);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutate, loading, error };
}

export function useUpdatePass() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (passId: string, updateData: any) => {
    setLoading(true);
    setError(null);
    try {
      const result = await MongoDBDataService.updatePass(passId, updateData);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutate, loading, error };
}

export function useDeletePass() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (passId: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await MongoDBDataService.deletePass(passId);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutate, loading, error };
}

export function useJoinWaitingList() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (eventId: string, userId: string, passId?: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await MongoDBDataService.joinWaitingList(eventId, userId, passId);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutate, loading, error };
}

export function useScanTicket() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (ticketId: string, scannerId?: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await MongoDBDataService.scanTicket(ticketId, scannerId);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutate, loading, error };
}

export function useUpdateUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (userId: string, name: string, email: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await MongoDBDataService.updateUser(userId, name, email);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutate, loading, error };
}

export function useValidateCoupon() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (code: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await MongoDBDataService.validateCoupon(code);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutate, loading, error };
}

export function useCalculateDiscount() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (code: string, amount: number, userId?: string, eventId?: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await MongoDBDataService.calculateDiscountedAmount(code, amount, userId, eventId);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutate, loading, error };
}

export function useIncrementCouponUsage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (code: string, userId?: string, couponId?: string, eventId?: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await MongoDBDataService.incrementCouponUsage(code, userId, couponId, eventId);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutate, loading, error };
}