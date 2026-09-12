import React, { useState, useEffect } from 'react';
import { X, Users, History, Search, RefreshCw, Clock, Mail, User, ShieldCheck } from 'lucide-react';

interface UniqueAccount {
  email: string;
  name: string;
  lastLogin: string;
  totalLogins: number;
}

interface LoginLogEntry {
  id: string;
  name: string;
  email: string;
  loginTime: string;
}

interface LoginHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginHistoryModal: React.FC<LoginHistoryModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'unique' | 'all'>('unique');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [uniqueAccounts, setUniqueAccounts] = useState<UniqueAccount[]>([]);
  const [historyLogs, setHistoryLogs] = useState<LoginLogEntry[]>([]);
  const [totalLogins, setTotalLogins] = useState(0);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/history');
      const data = await res.json();
      if (data.success) {
        setUniqueAccounts(data.uniqueAccounts || []);
        setHistoryLogs(data.history || []);
        setTotalLogins(data.totalLogins || 0);
      }
    } catch (e) {
      console.error('Failed to fetch login history:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  const filteredUnique = uniqueAccounts.filter(
    (acc) =>
      acc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLogs = historyLogs.filter(
    (log) =>
      log.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 space-y-5 text-slate-800 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-600 text-white flex items-center justify-center shadow-md shadow-rose-200">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-black text-lg text-slate-900">History</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-2xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>


        {/* Tabs & Search Header */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 shrink-0">
          <div className="flex items-center space-x-1 p-1 bg-slate-100 rounded-xl text-xs font-bold">
            <button
              onClick={() => setActiveTab('unique')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'unique'
                  ? 'bg-white text-rose-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tài Khoản Khác Nhau ({uniqueAccounts.length})
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'all'
                  ? 'bg-white text-rose-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Lịch Sử Chi Tiết ({historyLogs.length})
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative flex-1 sm:w-48">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm tên hoặc email..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-rose-500"
              />
            </div>
            <button
              onClick={fetchHistory}
              disabled={loading}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors shrink-0"
              title="Làm mới dữ liệu"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto min-h-[220px] pr-1 space-y-2">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin text-rose-500" />
              <span className="text-xs font-medium">Đang tải lịch sử truy cập...</span>
            </div>
          ) : activeTab === 'unique' ? (
            filteredUnique.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-xs font-medium">Chưa ghi nhận tài khoản Google nào đã sử dụng app.</p>
              </div>
            ) : (
              filteredUnique.map((acc, index) => (
                <div
                  key={acc.email}
                  className="p-3.5 bg-slate-50/80 hover:bg-rose-50/40 border border-slate-200/80 rounded-2xl flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-600 to-pink-500 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs uppercase">
                      {acc.name.charAt(0) || 'G'}
                    </div>
                    <div className="truncate">
                      <div className="flex items-center space-x-1.5">
                        <p className="font-bold text-sm text-slate-900 truncate">{acc.name}</p>
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      </div>
                      <div className="flex items-center space-x-3 text-xs text-slate-500 mt-0.5">
                        <span className="flex items-center space-x-1 truncate">
                          <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{acc.email}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-[11px] font-bold text-slate-500 flex items-center justify-end space-x-1">
                      <Clock className="w-3 h-3 text-rose-500" />
                      <span>{formatDate(acc.lastLogin)}</span>
                    </p>
                    <span className="inline-block mt-1 text-[10px] font-extrabold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">
                      {acc.totalLogins} lượt đăng nhập
                    </span>
                  </div>
                </div>
              ))
            )
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <History className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-xs font-medium">Không có nhật ký đăng nhập nào.</p>
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/60 rounded-xl flex items-center justify-between text-xs transition-colors"
              >
                <div className="flex items-center space-x-2.5 overflow-hidden">
                  <div className="w-7 h-7 rounded-full bg-slate-700 text-white font-bold text-xs flex items-center justify-center shrink-0 uppercase">
                    {log.name.charAt(0)}
                  </div>
                  <div className="truncate">
                    <span className="font-bold text-slate-900 mr-2">{log.name}</span>
                    <span className="text-slate-500">({log.email})</span>
                  </div>
                </div>
                <div className="text-right font-medium text-slate-500 shrink-0 flex items-center space-x-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{formatDate(log.loginTime)}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between shrink-0 text-xs text-slate-500 font-medium">
          <span>* Dữ liệu tự động lưu lịch sử mỗi khi có lượt đăng nhập</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
