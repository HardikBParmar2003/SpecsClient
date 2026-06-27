import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { HiOutlineMail } from 'react-icons/hi';

const AdminReminders = () => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      const { data } = await api.get('/reminders/due');
      if (data.success) {
        setReminders(data.data.reminders || []);
      }
    } catch (error) {
      toast.error('Failed to load reminders');
    } finally {
      setLoading(false);
    }
  };

  const sendReminder = async (id) => {
    try {
      const { data } = await api.put(`/reminders/${id}/send`);
      if (data.success) {
        toast.success('Reminder marked as sent!');
        fetchReminders(); // refresh
      }
    } catch (error) {
      toast.error('Failed to update reminder');
    }
  };

  if (loading) return <div className="py-20"><LoadingSpinner /></div>;

  return (
    <div>
      <div className="mb-8 border-b border-[var(--border-color)] pb-6">
        <h1 className="text-2xl font-light tracking-widest uppercase">Retention Reminders</h1>
        <p className="text-sm text-[var(--text-muted)] mt-2">Automated system identifies customers due for an eye check-up.</p>
      </div>

      <div className="glassmorphism rounded-xl border border-[var(--border-color)] overflow-hidden">
        <div className="p-6 border-b border-[var(--border-color)] bg-[var(--bg-card)]">
          <h2 className="text-sm font-medium tracking-widest uppercase">Due Today ({reminders.length})</h2>
        </div>
        {reminders.length === 0 ? (
          <div className="p-8 text-center text-[var(--text-muted)]">No reminders due today.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[var(--text-secondary)]">
              <thead className="text-xs text-[var(--text-faint)] uppercase bg-[var(--input-bg)]">
                <tr>
                  <th className="px-6 py-4 font-medium tracking-wider">Customer</th>
                  <th className="px-6 py-4 font-medium tracking-wider">Contact</th>
                  <th className="px-6 py-4 font-medium tracking-wider">Last Purchase</th>
                  <th className="px-6 py-4 font-medium tracking-wider w-1/3">Generated Message</th>
                  <th className="px-6 py-4 font-medium tracking-wider text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {reminders.map((rem) => {
                  const messageText = encodeURIComponent(`👓 *ખાસ યાદ - રાધેશ્યામ ચશ્માઘર* 🙏\n\nનમસ્તે ${rem.name} જી,\n\nઆશા છે કે તમે કુશળ હશો. તમે છેલ્લે તારીખ  ${new Date(rem.order_date).toLocaleDateString('en-GB')}  ના રોજ અમારા રાધેશ્યામ ચશ્માઘર પરથી ચશ્મા ખરીદ્યા હતા.\n\nઆંખોની સારી તંદુરસ્તી અને નંબરની ચોકસાઈ જાળવી રાખવા માટે, સમયસર આઈ-ચેકઅપ (Eye Check-up) કરાવી લેવું ખૂબ જ હિતાવહ છે. બસ, તમારી આંખોની કાળજીના ભાગરૂપે જ અમે તમને આ નાની યાદ અપાવી રહ્યા છીએ.\n\nતમને જ્યારે પણ અનુકૂળતા હોય ત્યારે પધારવા વિનંતી છે. અમને રાધેશ્યામ ચશ્માઘર પરિવાર વતી તમારી ફરી સેવા કરવાનો અને અમારું નવું કલેક્શન બતાવવાનો ખૂબ આનંદ થશે! ✨`);
                  // const messageText = encodeURIComponent(`🔔 *Your Specs Reminder* 🔔\n\nHey ${rem.name} 👋,\nYou bought new specs on ${new Date(rem.order_date).toLocaleDateString()}, and it's time for a check-up! Consider checking out our latest specs.`);
                  const waUrl = `https://wa.me/${rem.mobile}?text=${messageText}`;
                  return (
                  <tr key={rem.order_id} className="hover:bg-[var(--bg-card)] transition-colors">
                    <td className="px-6 py-4 font-medium text-[var(--text-primary)]">{rem.name}</td>
                    <td className="px-6 py-4">{rem.mobile}</td>
                    <td className="px-6 py-4">{new Date(rem.order_date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-xs text-[var(--text-muted)]">🔔 *Your Specs Reminder* 🔔...</td>
                    <td className="px-6 py-4 flex justify-center items-center space-x-3">
                      <a 
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-2 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white border border-green-500/30 px-3 py-1.5 rounded transition-colors text-xs uppercase tracking-wider cursor-pointer"
                      >
                        <span>WhatsApp Web</span>
                      </a>
                      <button 
                        onClick={() => sendReminder(rem.order_id)}
                        className="inline-flex items-center space-x-2 bg-luxury-gold/10 text-luxury-gold hover:bg-luxury-gold hover:text-[var(--bg-primary)] border border-luxury-gold/30 px-3 py-1.5 rounded transition-colors text-xs uppercase tracking-wider cursor-pointer"
                      >
                        <HiOutlineMail className="w-4 h-4" />
                        <span>Mark Sent</span>
                      </button>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReminders;
