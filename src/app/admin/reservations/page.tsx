"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import {
  CalendarIcon,
  UserPlus,
  Edit,
  Trash2,
  GripVertical,
  Clock,
  User,
  CalendarHeart,
  CheckCircle,
  ChefHat,
  X,
  Search,
  Users,
  MapPin,
  ExternalLink,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Eye,
  XCircle,
} from "lucide-react";

import {
  DndContext,
  DragEndEvent,
  useDraggable,
  useDroppable,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";

// ─── Types ──────────────────────────────────────────────────────

type ReservationStatus = "Confirmed" | "Seated" | "Cancelled";
type TableStatus = "Available" | "Reserved" | "Seated" | "Dirty";

interface Reservation {
  id: string;
  guestName: string;
  partySize: number;
  dateTime: Date;
  status: ReservationStatus;
  table: number | string;
  notes?: string;
}

interface FloorTable {
  id: number;
  seats: number;
  status: TableStatus;
  x: number;
  y: number;
  shape?: "circle" | "rectangle";
  server?: string;
}

// ─── Data ───────────────────────────────────────────────────────

const initialFloorTables: FloorTable[] = [
  { id: 1, seats: 2, status: "Available", x: 40, y: 40, shape: "circle", server: "Sarah M." },
  { id: 2, seats: 2, status: "Available", x: 40, y: 160, shape: "circle", server: "Sarah M." },
  { id: 3, seats: 4, status: "Reserved", x: 40, y: 280, shape: "circle", server: "David J." },
  { id: 4, seats: 4, status: "Seated", x: 40, y: 400, shape: "circle", server: "David J." },
  { id: 10, seats: 4, status: "Available", x: 200, y: 80, shape: "rectangle", server: "Elena R." },
  { id: 11, seats: 4, status: "Available", x: 380, y: 80, shape: "rectangle", server: "Elena R." },
  { id: 12, seats: 6, status: "Seated", x: 200, y: 240, shape: "rectangle", server: "Sarah M." },
  { id: 13, seats: 6, status: "Available", x: 380, y: 240, shape: "rectangle", server: "David J." },
  { id: 20, seats: 4, status: "Dirty", x: 600, y: 40, shape: "rectangle", server: "Elena R." },
  { id: 21, seats: 4, status: "Available", x: 600, y: 180, shape: "rectangle", server: "David J." },
  { id: 22, seats: 4, status: "Available", x: 600, y: 320, shape: "rectangle", server: "Sarah M." },
];

const statusColors: Record<TableStatus, { bg: string; border: string; text: string; dot: string }> = {
  Available: { bg: "#10B981", border: "#10B981", text: "#10B981", dot: "#10B981" },
  Reserved: { bg: "#F59E0B", border: "#F59E0B", text: "#F59E0B", dot: "#F59E0B" },
  Seated: { bg: "#EF4444", border: "#EF4444", text: "#EF4444", dot: "#EF4444" },
  Dirty: { bg: "#8B5CF6", border: "#8B5CF6", text: "#8B5CF6", dot: "#8B5CF6" },
};

const resStatusColors: Record<ReservationStatus, string> = {
  Confirmed: "#3B82F6",
  Seated: "#10B981",
  Cancelled: "#EF4444",
};

// ─── Draggable Card ─────────────────────────────────────────────

function DraggableReservationCard({ reservation }: { reservation: Reservation }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `res-${reservation.id}`,
    data: { reservation },
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: isDragging ? 50 : 1 }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`px-4 py-3 mb-2 bg-[#0D0D12] border border-[#1F1F28] rounded-xl hover:border-[#2D2D3A] transition-all ${isDragging ? "opacity-40" : ""}`}
    >
      <div className="flex items-center gap-2">
        <div {...listeners} {...attributes} className="cursor-grab p-0.5 text-neutral-600 hover:text-neutral-400">
          <GripVertical className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <div className="font-medium text-sm text-white">{reservation.guestName}</div>
          <div className="text-[11px] text-neutral-500 flex justify-between mt-0.5">
            <span>{reservation.partySize} guests</span>
            <span className="font-mono">{format(reservation.dateTime, "p")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Droppable Table ────────────────────────────────────────────

function DroppableTable({
  table,
  reservation,
  isRecentlyConfirmed,
  isDimmed,
  onClickTable,
}: {
  table: FloorTable;
  reservation?: Reservation;
  isRecentlyConfirmed?: boolean;
  isDimmed?: boolean;
  onClickTable: (table: FloorTable, res?: Reservation) => void;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: `table-${table.id}`,
    data: { table },
  });

  const sc = statusColors[table.status];
  const isCircle = table.shape === "circle";

  return (
    <div
      ref={setNodeRef}
      onClick={() => onClickTable(table, reservation)}
      className={`absolute flex flex-col items-center justify-center border-2 transition-all cursor-pointer z-10 ${isCircle ? "rounded-full w-[76px] h-[76px]" : "rounded-xl w-[110px] h-[76px]"} ${isDimmed ? "opacity-20 grayscale pointer-events-none border-dashed" : ""}`}
      style={{
        left: table.x,
        top: table.y,
        backgroundColor: `${sc.bg}10`,
        borderColor: isOver && !isDimmed ? "#fff" : `${sc.border}40`,
        boxShadow: isRecentlyConfirmed && !isDimmed ? `0 0 20px ${sc.bg}60` : isOver && !isDimmed ? "0 0 15px rgba(255,255,255,0.3)" : "none",
        transform: isOver && !isDimmed ? "scale(1.08)" : isRecentlyConfirmed ? "scale(1.05)" : "scale(1)",
      }}
    >
      <div className="font-bold text-sm leading-none" style={{ color: sc.text }}>
        T{table.id}
      </div>
      <div className="text-[9px] mt-0.5" style={{ color: `${sc.text}80` }}>
        {table.seats} seats
      </div>
      {reservation && (
        <div className="text-[9px] font-medium truncate w-full text-center px-1 mt-0.5 text-white/70">
          {reservation.guestName.split(" ")[0]}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[] | null>(null);
  const [tables, setTables] = useState<FloorTable[]>(initialFloorTables);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"floorplan" | "list">("floorplan");
  const [filterStatus, setFilterStatus] = useState<TableStatus | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [formName, setFormName] = useState("");
  const [formParty, setFormParty] = useState("2");
  const [formTable, setFormTable] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formTime, setFormTime] = useState("19:00");
  const [formNotes, setFormNotes] = useState("");

  // Table detail popover
  const [detailTable, setDetailTable] = useState<{ table: FloorTable; res?: Reservation } | null>(null);

  // DnD
  const [activeId, setActiveId] = useState<string | null>(null);
  const [recentConfirmations, setRecentConfirmations] = useState<number[]>([]);

  // Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "warning">("success");

  useEffect(() => {
    if (toastMsg) {
      const t = setTimeout(() => setToastMsg(null), 3500);
      return () => clearTimeout(t);
    }
  }, [toastMsg]);

  const showToast = (msg: string, type: "success" | "warning" = "success") => {
    setToastMsg(msg);
    setToastType(type);
  };

  useEffect(() => {
    const initial: Reservation[] = [
      { id: "1", guestName: "Alice Johnson", partySize: 4, dateTime: new Date(new Date().setHours(19, 0, 0, 0)), status: "Confirmed", table: 3, notes: "Window seat requested" },
      { id: "2", guestName: "Bob Williams", partySize: 2, dateTime: new Date(new Date().setHours(18, 30, 0, 0)), status: "Confirmed", table: "N/A" },
      { id: "3", guestName: "Charlie Brown", partySize: 5, dateTime: new Date(new Date().setHours(20, 0, 0, 0)), status: "Confirmed", table: "N/A" },
      { id: "4", guestName: "Diana Prince", partySize: 2, dateTime: new Date(new Date().setHours(17, 30, 0, 0)), status: "Seated", table: 12 },
      { id: "5", guestName: "Ethan Hunt", partySize: 3, dateTime: new Date(new Date().setHours(20, 30, 0, 0)), status: "Confirmed", table: "N/A", notes: "Birthday celebration" },
    ];
    setReservations(initial.sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime()));
    setLoading(false);
  }, []);

  // ─── Helpers ──────────────────────────────────

  const triggerConfirmationVisual = (tableId: number) => {
    setActiveId(null);
    setRecentConfirmations((prev) => [...prev, tableId]);
    setTimeout(() => setRecentConfirmations((prev) => prev.filter((id) => id !== tableId)), 3000);
  };

  const handleQuickSeat = (res: Reservation) => {
    let assignedTableId: number;
    if (res.table === "N/A" || !res.table) {
      const available = tables.filter((t) => t.status === "Available" && t.seats >= res.partySize).sort((a, b) => a.seats - b.seats);
      if (available.length === 0) {
        showToast(`No table available for party of ${res.partySize}.`, "warning");
        return;
      }
      assignedTableId = available[0].id;
    } else {
      assignedTableId = parseInt(String(res.table), 10);
    }

    const tableData = tables.find((t) => t.id === assignedTableId);
    if (tableData?.status === "Seated" || tableData?.status === "Dirty") {
      showToast(`Table ${assignedTableId} is ${tableData.status.toLowerCase()}.`, "warning");
      return;
    }

    setReservations((prev) => prev!.map((r) => (r.id === res.id ? { ...r, status: "Seated", table: assignedTableId } : r)));
    setTables((prev) => prev.map((t) => (t.id === assignedTableId ? { ...t, status: "Seated" } : t)));
    triggerConfirmationVisual(assignedTableId);
    showToast(`${res.guestName} seated at Table ${assignedTableId}.`);
  };

  const handleDelete = (id: string) => {
    setReservations((prev) => prev!.filter((r) => r.id !== id));
    showToast("Reservation deleted.", "warning");
  };

  const openAddForm = () => {
    setSelectedReservation(null);
    setFormName("");
    setFormParty("2");
    setFormTable("");
    setFormDate(format(new Date(), "yyyy-MM-dd"));
    setFormTime("19:00");
    setFormNotes("");
    setIsFormOpen(true);
  };

  const openEditForm = (res: Reservation) => {
    setSelectedReservation(res);
    setFormName(res.guestName);
    setFormParty(res.partySize.toString());
    setFormTable(typeof res.table === "number" ? res.table.toString() : res.table !== "N/A" ? String(res.table) : "");
    setFormDate(format(res.dateTime, "yyyy-MM-dd"));
    setFormTime(format(res.dateTime, "HH:mm"));
    setFormNotes(res.notes || "");
    setIsFormOpen(true);
  };

  const handleSubmitForm = () => {
    if (!formName.trim()) {
      showToast("Guest name is required.", "warning");
      return;
    }
    const partySize = parseInt(formParty, 10) || 2;
    const tableNum = formTable.trim() ? parseInt(formTable, 10) : null;
    const dateTime = new Date(`${formDate}T${formTime}`);

    if (tableNum) {
      const overlap = reservations?.find(
        (r) =>
          String(r.table) === String(tableNum) &&
          r.id !== selectedReservation?.id &&
          r.status !== "Cancelled" &&
          Math.abs(r.dateTime.getTime() - dateTime.getTime()) < 2 * 60 * 60 * 1000
      );
      if (overlap) {
        showToast(`Table ${tableNum} is booked for ${overlap.guestName}.`, "warning");
        return;
      }
    }

    if (selectedReservation) {
      setReservations((prev) =>
        prev!.map((r) =>
          r.id === selectedReservation.id
            ? { ...r, guestName: formName, partySize, table: tableNum ?? "N/A", dateTime, notes: formNotes, status: r.status }
            : r
        )
      );
      showToast(`${formName}'s booking updated.`);
    } else {
      const newRes: Reservation = {
        id: Date.now().toString(),
        guestName: formName,
        partySize,
        dateTime,
        status: "Confirmed",
        table: tableNum ?? "N/A",
        notes: formNotes,
      };
      setReservations((prev) => [...(prev ?? []), newRes].sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime()));

      if (tableNum && Math.abs(dateTime.getTime() - new Date().getTime()) < 4 * 60 * 60 * 1000) {
        setTables((prev) => prev.map((t) => (t.id === tableNum && t.status === "Available" ? { ...t, status: "Reserved" } : t)));
      }
      showToast(`${formName}'s reservation confirmed.`);
    }

    setIsFormOpen(false);
    setSelectedReservation(null);
  };

  // DnD
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  );

  function handleDragStart(event: any) {
    setActiveId(event.active.id);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (over && over.id.toString().startsWith("table-")) {
      const tableId = parseInt(over.id.toString().replace("table-", ""), 10);
      const resId = active.id.toString().replace("res-", "");
      const resData = reservations?.find((r) => r.id === resId);
      const tableData = tables.find((t) => t.id === tableId);

      if (tableData?.status === "Seated" || tableData?.status === "Dirty") {
        showToast(`Table ${tableId} is ${tableData.status.toLowerCase()}.`, "warning");
        return;
      }

      if (resData) {
        const overlap = reservations?.find(
          (r) =>
            String(r.table) === String(tableId) &&
            r.id !== resId &&
            r.status !== "Cancelled" &&
            Math.abs(r.dateTime.getTime() - resData.dateTime.getTime()) < 2 * 60 * 60 * 1000
        );
        if (overlap) {
          showToast(`Table ${tableId} is booked for ${overlap.guestName}.`, "warning");
          return;
        }
      }

      setReservations((prev) => prev!.map((r) => (r.id === resId ? { ...r, table: tableId, status: "Seated" } : r)));
      setTables((prev) => prev.map((t) => (t.id === tableId ? { ...t, status: "Seated" } : t)));
      triggerConfirmationVisual(tableId);
      showToast(`${resData?.guestName || "Guest"} seated at Table ${tableId}.`);
    }
  }

  const waitingReservations = reservations?.filter((r) => r.status === "Confirmed" && r.table === "N/A") || [];

  const filteredReservations = reservations?.filter(
    (r) =>
      r.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleClickTable = (table: FloorTable, res?: Reservation) => {
    setDetailTable({ table, res });
  };

  // KPIs
  const totalRes = reservations?.length ?? 0;
  const seatedCount = reservations?.filter((r) => r.status === "Seated").length ?? 0;
  const confirmedCount = reservations?.filter((r) => r.status === "Confirmed").length ?? 0;
  const availableTables = tables.filter((t) => t.status === "Available").length;

  return (
    <div className="p-8 pb-20 font-sans max-w-[1400px] mx-auto relative">
      {/* Toast */}
      {toastMsg && (
        <div
          className={`fixed top-6 right-6 z-[60] px-5 py-3 rounded-xl text-sm font-medium shadow-2xl border transition-all animate-[slideIn_0.3s_ease-out] ${
            toastType === "success"
              ? "bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30"
              : "bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30"
          }`}
        >
          <div className="flex items-center gap-2">
            {toastType === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {toastMsg}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-normal text-white tracking-tight">Reservations & Floor Plan</h1>
          <p className="text-neutral-400 mt-2">Manage bookings and real-time table assignments.</p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="https://www.opentable.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-[#111116] border border-[#1F1F28] rounded-lg text-xs text-neutral-400 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            OpenTable <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href="https://www.yelp.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-[#111116] border border-[#1F1F28] rounded-lg text-xs text-neutral-400 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            Yelp <ExternalLink className="w-3 h-3" />
          </a>
          <button
            onClick={openAddForm}
            className="px-5 py-2.5 bg-white text-black hover:bg-neutral-200 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <UserPlus className="w-4 h-4" /> Add Booking
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Reservations", value: totalRes, color: "#3B82F6" },
          { label: "Confirmed", value: confirmedCount, color: "#F59E0B" },
          { label: "Seated", value: seatedCount, color: "#10B981" },
          { label: "Tables Available", value: availableTables, color: "#8B5CF6" },
        ].map((k) => (
          <div key={k.label} className="bg-[#111116] border border-[#1F1F28] rounded-xl px-4 py-3 flex items-center gap-3">
            <div className="w-2 h-8 rounded-full" style={{ backgroundColor: k.color }} />
            <div>
              <div className="text-lg font-mono text-white">{k.value}</div>
              <div className="text-[10px] text-neutral-500 uppercase tracking-wider">{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {([
          { key: "floorplan" as const, label: "Floor Plan" },
          { key: "list" as const, label: "List View" },
        ]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium border transition-all flex items-center gap-2 ${
              activeTab === tab.key
                ? "bg-white text-black border-white"
                : "bg-[#111116] text-neutral-400 border-[#1F1F28] hover:text-white hover:bg-[#1C1C24]"
            }`}
          >
            {tab.key === "floorplan" ? <MapPin className="w-4 h-4" /> : <CalendarIcon className="w-4 h-4" />}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ═══════════════ FLOOR PLAN TAB ═══════════════ */}
      {activeTab === "floorplan" && (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex flex-col lg:flex-row gap-5">
            {/* Left: Waitlist */}
            <div className="w-full lg:w-[280px] bg-[#111116] border border-[#1F1F28] rounded-2xl flex flex-col h-[560px]">
              <div className="px-4 py-3 border-b border-[#1F1F28] bg-[#0D0D12] rounded-t-2xl flex justify-between items-center">
                <span className="text-xs text-neutral-500 uppercase tracking-wider">Waitlist</span>
                <span className="text-xs font-mono text-white bg-[#1F1F28] px-2 py-0.5 rounded-md">{waitingReservations.length}</span>
              </div>
              <div className="p-3 overflow-y-auto flex-1">
                {loading ? (
                  <div className="flex justify-center mt-16">
                    <div className="w-5 h-5 border-2 border-neutral-600 border-t-white rounded-full animate-spin" />
                  </div>
                ) : waitingReservations.length > 0 ? (
                  waitingReservations.map((res) => <DraggableReservationCard key={res.id} reservation={res} />)
                ) : (
                  <div className="text-center mt-16">
                    <CalendarIcon className="mx-auto w-8 h-8 text-neutral-700 mb-2" />
                    <p className="text-xs text-neutral-600">No pending waitlist.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Floor Plan */}
            <div className="flex-1 bg-[#111116] border border-[#1F1F28] rounded-2xl overflow-hidden relative">
              {/* Status Filter Pills */}
              <div className="absolute top-4 left-4 z-20 flex gap-2">
                {(["Available", "Reserved", "Seated", "Dirty"] as TableStatus[]).map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus((prev) => (prev === status ? null : status))}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-medium border flex items-center gap-1.5 transition-all ${
                      filterStatus === status
                        ? "bg-white/10 border-white/30 text-white"
                        : filterStatus
                          ? "bg-[#111116] border-[#1F1F28] text-neutral-600"
                          : "bg-[#111116]/80 border-[#1F1F28] text-neutral-400 hover:text-white"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: statusColors[status].dot }} />
                    {status}
                  </button>
                ))}
              </div>

              {/* Canvas */}
              <div
                className="w-full h-[560px] relative overflow-hidden"
                style={{
                  background: "#0A0A0F",
                  backgroundImage:
                    "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
                  backgroundSize: "20px 20px",
                }}
              >
                {/* Wall dividers */}
                <div className="absolute top-0 bottom-0 left-[160px] w-0.5 bg-neutral-800 opacity-40" />
                <div className="absolute top-0 bottom-0 right-[180px] w-0.5 bg-neutral-800 opacity-40" />

                {tables.map((table) => (
                  <DroppableTable
                    key={table.id}
                    table={table}
                    reservation={reservations?.find((r) => String(r.table) === String(table.id))}
                    isRecentlyConfirmed={recentConfirmations.includes(table.id)}
                    isDimmed={filterStatus !== null && filterStatus !== table.status}
                    onClickTable={handleClickTable}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* DnD Overlay (ghost of dragged card) */}
          <DragOverlay>
            {activeId && reservations?.find((r) => `res-${r.id}` === activeId) && (
              <div className="px-4 py-3 bg-[#1F1F28] border border-white/20 rounded-xl shadow-2xl w-[240px]">
                <div className="text-sm text-white font-medium">
                  {reservations.find((r) => `res-${r.id}` === activeId)!.guestName}
                </div>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      )}

      {/* ═══════════════ LIST TAB ═══════════════ */}
      {activeTab === "list" && (
        <div className="bg-[#111116] border border-[#1F1F28] rounded-2xl overflow-hidden">
          {/* Search */}
          <div className="px-6 py-4 border-b border-[#1F1F28] bg-[#0D0D12]">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search guests..."
                className="w-full bg-[#111116] border border-[#1F1F28] rounded-lg pl-10 pr-4 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-white/20 placeholder-neutral-500"
              />
            </div>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_2fr_auto] gap-4 px-6 py-3 border-b border-[#1F1F28] text-[10px] text-neutral-500 uppercase tracking-wider">
            <span>Guest</span>
            <span>Time</span>
            <span>Status</span>
            <span>Table</span>
            <span>Notes</span>
            <span className="text-right">Actions</span>
          </div>

          {/* Rows */}
          {loading ? (
            <div className="py-16 text-center">
              <div className="w-5 h-5 border-2 border-neutral-600 border-t-white rounded-full animate-spin mx-auto" />
            </div>
          ) : filteredReservations && filteredReservations.length > 0 ? (
            filteredReservations.map((res) => (
              <div
                key={res.id}
                className="grid grid-cols-[2fr_1fr_1fr_1fr_2fr_auto] gap-4 px-6 py-4 border-b border-[#1F1F28] items-center hover:bg-white/[0.02] transition-colors group"
              >
                <div>
                  <div className="text-sm text-white font-medium">{res.guestName}</div>
                  <div className="text-[11px] text-neutral-500">{res.partySize} guests</div>
                </div>
                <div className="text-sm text-neutral-400 font-mono">{format(res.dateTime, "p")}</div>
                <div>
                  <span
                    className="px-2.5 py-1 rounded-full text-[10px] font-medium border"
                    style={{
                      backgroundColor: `${resStatusColors[res.status]}15`,
                      color: resStatusColors[res.status],
                      borderColor: `${resStatusColors[res.status]}30`,
                    }}
                  >
                    {res.status}
                  </span>
                </div>
                <div className="text-sm text-neutral-400 font-mono">{res.table}</div>
                <div className="text-xs text-neutral-500 truncate">{res.notes || "—"}</div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {res.status === "Confirmed" && (
                    <button
                      onClick={() => handleQuickSeat(res)}
                      className="p-1.5 hover:bg-[#10B981]/10 rounded-md"
                      title="Seat Guest"
                    >
                      <CheckCircle className="w-4 h-4 text-[#10B981]" />
                    </button>
                  )}
                  <button onClick={() => openEditForm(res)} className="p-1.5 hover:bg-white/5 rounded-md">
                    <Edit className="w-4 h-4 text-neutral-500" />
                  </button>
                  <button onClick={() => handleDelete(res.id)} className="p-1.5 hover:bg-[#EF4444]/10 rounded-md">
                    <Trash2 className="w-4 h-4 text-neutral-500 hover:text-[#EF4444]" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-16 text-center text-neutral-500 text-sm">No reservations found.</div>
          )}
        </div>
      )}

      {/* ═══════════════ TABLE DETAIL POPOVER ═══════════════ */}
      {detailTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setDetailTable(null)}>
          <div
            className="bg-[#111116] border border-[#1F1F28] rounded-2xl w-[320px] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-[#1F1F28] flex justify-between items-center">
              <h3 className="text-white font-medium">Table {detailTable.table.id}</h3>
              <button onClick={() => setDetailTable(null)} className="p-1 hover:bg-white/5 rounded-md">
                <X className="w-4 h-4 text-neutral-500" />
              </button>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Status</span>
                <span
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-medium"
                  style={{
                    backgroundColor: `${statusColors[detailTable.table.status].bg}15`,
                    color: statusColors[detailTable.table.status].text,
                  }}
                >
                  {detailTable.table.status}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Seats</span>
                <span className="text-white font-mono">{detailTable.table.seats}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Server</span>
                <span className="text-white">{detailTable.table.server || "Unassigned"}</span>
              </div>
              {detailTable.res && (
                <div className="mt-3 pt-3 border-t border-[#1F1F28] space-y-2">
                  <div className="text-[10px] text-neutral-500 uppercase tracking-wider">Reservation</div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-500">Guest</span>
                    <span className="text-white font-medium">{detailTable.res.guestName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-500">Party</span>
                    <span className="text-white font-mono">{detailTable.res.partySize}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-500">Time</span>
                    <span className="text-white font-mono">{format(detailTable.res.dateTime, "p")}</span>
                  </div>
                  {detailTable.res.notes && (
                    <p className="text-xs text-[#F59E0B] bg-[#F59E0B]/5 px-3 py-2 rounded-lg border border-[#F59E0B]/10 mt-2">
                      {detailTable.res.notes}
                    </p>
                  )}
                </div>
              )}
              {!detailTable.res && (
                <p className="text-xs text-neutral-600 text-center italic mt-2">
                  {detailTable.table.status === "Available" ? "Table is currently available" : `Table is ${detailTable.table.status.toLowerCase()}`}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ ADD/EDIT MODAL ═══════════════ */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setIsFormOpen(false)}>
          <div
            className="bg-[#111116] border border-[#1F1F28] rounded-2xl w-[420px] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-[#1F1F28] flex justify-between items-center">
              <div>
                <h3 className="text-white font-medium">{selectedReservation ? "Edit Reservation" : "New Reservation"}</h3>
                <p className="text-xs text-neutral-500 mt-0.5">System suggests best table from floor plan.</p>
              </div>
              <button onClick={() => setIsFormOpen(false)} className="p-1 hover:bg-white/5 rounded-md">
                <X className="w-4 h-4 text-neutral-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs text-neutral-500 mb-1.5">Guest Name *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g., John Doe"
                  className="w-full bg-[#0D0D12] border border-[#2D2D3A] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-white/20 placeholder-neutral-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-neutral-500 mb-1.5">Party Size</label>
                  <input
                    type="number"
                    value={formParty}
                    onChange={(e) => setFormParty(e.target.value)}
                    className="w-full bg-[#0D0D12] border border-[#2D2D3A] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-white/20"
                  />
                </div>
                <div>
                  <label className="block text-xs text-neutral-500 mb-1.5">Table #</label>
                  <input
                    type="text"
                    value={formTable}
                    onChange={(e) => setFormTable(e.target.value)}
                    placeholder="Auto"
                    className="w-full bg-[#0D0D12] border border-[#2D2D3A] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-white/20 placeholder-neutral-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-neutral-500 mb-1.5">Date</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full bg-[#0D0D12] border border-[#2D2D3A] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-white/20"
                  />
                </div>
                <div>
                  <label className="block text-xs text-neutral-500 mb-1.5">Time</label>
                  <input
                    type="time"
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full bg-[#0D0D12] border border-[#2D2D3A] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-white/20"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-neutral-500 mb-1.5">Notes</label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  rows={2}
                  placeholder="e.g., Window seat, birthday celebration..."
                  className="w-full bg-[#0D0D12] border border-[#2D2D3A] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-white/20 resize-none placeholder-neutral-500"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="flex-1 py-2.5 bg-[#1F1F28] text-neutral-400 hover:text-white rounded-xl text-sm border border-[#2D2D3A] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitForm}
                  className="flex-1 py-2.5 bg-white text-black hover:bg-neutral-200 rounded-xl text-sm font-medium transition-colors"
                >
                  {selectedReservation ? "Save Changes" : "Confirm Booking"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
