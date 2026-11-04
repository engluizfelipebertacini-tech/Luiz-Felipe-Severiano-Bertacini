export interface GoogleCalendarEventPayload {
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime: string;
    timeZone?: string;
  };
  end: {
    dateTime: string;
    timeZone?: string;
  };
}

export async function fetchGoogleCalendarEvents(accessToken: string, timeMin?: string, timeMax?: string) {
  try {
    const url = new URL('https://www.googleapis.com/calendar/v3/calendars/primary/events');
    url.searchParams.append('singleEvents', 'true');
    url.searchParams.append('orderBy', 'startTime');
    url.searchParams.append('timeZone', 'America/Sao_Paulo');
    if (timeMin) url.searchParams.append('timeMin', timeMin);
    if (timeMax) url.searchParams.append('timeMax', timeMax);

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Erro ${res.status} ao consultar Google Calendar`);
    }

    const data = await res.json();
    return data.items || [];
  } catch (error) {
    console.error('Erro na integração com Google Calendar:', error);
    throw error;
  }
}

export async function createGoogleCalendarEvent(accessToken: string, event: GoogleCalendarEventPayload) {
  try {
    const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...event,
        start: {
          ...event.start,
          timeZone: 'America/Sao_Paulo',
        },
        end: {
          ...event.end,
          timeZone: 'America/Sao_Paulo',
        },
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Erro ${res.status} ao criar evento no Google Calendar`);
    }

    return await res.json();
  } catch (error) {
    console.error('Erro ao criar evento no Google Calendar:', error);
    throw error;
  }
}

export async function deleteGoogleCalendarEvent(accessToken: string, eventId: string) {
  try {
    const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok && res.status !== 404) {
      throw new Error(`Erro ${res.status} ao excluir evento do Google Calendar`);
    }

    return true;
  } catch (error) {
    console.error('Erro ao excluir evento do Google Calendar:', error);
    throw error;
  }
}
