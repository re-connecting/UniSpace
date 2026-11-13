import { FormEvent, useState } from 'react';
import { Edit2, Plus, Power, Search, X } from 'lucide-react';
import {
  ALL_FACILITIES,
  BUILDINGS,
  SPACE_IMAGE_BY_TYPE,
  SPACE_TYPES,
} from '../data/seedData';
import {
  BuildingName,
  Facility,
  OccupancyStatus,
  SpaceType,
  StudySpace,
} from '../types/unispace';
import { ConfirmDialog } from './ConfirmDialog';
import { OccupancyStatusBadge } from './StatusBadge';

interface ManageSpacesPageProps {
  spaces: StudySpace[];
  onSaveSpace: (space: StudySpace, isNew: boolean) => void;
  onToggleSpaceActive: (spaceId: string) => void;
}

const IMAGE_PRESETS = [
  { label: 'Individual Library Desk', url: SPACE_IMAGE_BY_TYPE.desk },
  { label: 'Glass Discussion Room', url: SPACE_IMAGE_BY_TYPE.group },
  { label: 'Discussion Room', url: SPACE_IMAGE_BY_TYPE.discussion },
  { label: 'Tutorial / Lab Room', url: SPACE_IMAGE_BY_TYPE.tutorial },
  { label: 'APU Study Pod', url: SPACE_IMAGE_BY_TYPE.pod },
];

export function ManageSpacesPage({
  spaces,
  onSaveSpace,
  onToggleSpaceActive,
}: ManageSpacesPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [buildingFilter, setBuildingFilter] = useState<BuildingName | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<OccupancyStatus | 'All'>('All');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState('');

  // Form fields
  const [name, setName] = useState('');
  const [building, setBuilding] = useState<BuildingName>('Block A');
  const [floor, setFloor] = useState('Level 3');
  const [spaceType, setSpaceType] = useState<SpaceType>('Discussion Room');
  const [capacity, setCapacity] = useState<string>('4');
  const [description, setDescription] = useState('');
  const [facilities, setFacilities] = useState<Facility[]>(['Wi-Fi', 'Power Outlets']);
  const [occupancyStatus, setOccupancyStatus] =
    useState<OccupancyStatus>('Available');
  const [imageUrl, setImageUrl] = useState(SPACE_IMAGE_BY_TYPE.group);

  const [toggleTarget, setToggleTarget] = useState<StudySpace | null>(null);

  const openAddModal = () => {
    setEditingId(null);
    setName('');
    setBuilding('Block A');
    setFloor('Level 3');
    setSpaceType('Discussion Room');
    setCapacity('6');
    setDescription('');
    setFacilities(['Wi-Fi', 'Power Outlets', 'Whiteboard']);
    setOccupancyStatus('Available');
    setImageUrl(SPACE_IMAGE_BY_TYPE.group);
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (sp: StudySpace) => {
    setEditingId(sp.id);
    setName(sp.name);
    setBuilding(sp.building);
    setFloor(sp.floor);
    setSpaceType(sp.spaceType);
    setCapacity(String(sp.capacity));
    setDescription(sp.description);
    setFacilities(sp.facilities);
    setOccupancyStatus(sp.occupancyStatus);
    setImageUrl(sp.imageUrl);
    setFormError('');
    setModalOpen(true);
  };

  const toggleFacility = (f: Facility) => {
    setFacilities((prev) =>
      prev.includes(f) ? prev.filter((item) => item !== f) : [...prev, f]
    );
  };

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    setFormError('');

    const capNum = Number(capacity);
    if (!name.trim() || !floor.trim() || !description.trim()) {
      setFormError('Space name, floor, and description are required.');
      return;
    }
    if (Number.isNaN(capNum) || capNum < 1) {
      setFormError('Capacity must be at least 1.');
      return;
    }

    const nextId =
      editingId || `SPC-${String(spaces.length + 1).padStart(3, '0')}`;

    const existing = editingId ? spaces.find((s) => s.id === editingId) : null;

    onSaveSpace(
      {
        id: nextId,
        name: name.trim(),
        building,
        floor: floor.trim(),
        spaceType,
        capacity: capNum,
        facilities,
        occupancyStatus,
        description: description.trim(),
        imageUrl: imageUrl.trim() || SPACE_IMAGE_BY_TYPE.group,
        isActive: existing ? existing.isActive : true,
      },
      !editingId
    );
    setModalOpen(false);
  };

  const filtered = spaces.filter((s) => {
    const q = searchQuery.trim().toLowerCase();
    if (
      q &&
      !s.name.toLowerCase().includes(q) &&
      !s.id.toLowerCase().includes(q) &&
      !s.building.toLowerCase().includes(q)
    ) {
      return false;
    }
    if (buildingFilter !== 'All' && s.building !== buildingFilter) return false;
    if (statusFilter !== 'All' && s.occupancyStatus !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-black">
            Manage Study Spaces
          </h2>
          <p className="mt-1.5 text-sm text-black">
            Add campus rooms, update equipment and live status, or pause spaces temporarily.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#007AFF] text-white text-sm font-semibold hover:bg-[#0066D6] shadow-[0_8px_20px_rgba(0,122,255,0.26)] transition-all active:scale-[0.98] cursor-pointer whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>Add New Space</span>
        </button>
      </div>

      {/* Filters */}
      <div className="liquid-glass rounded-[26px] p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search
            className="w-4 h-4 text-black absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="text"
            aria-label="Search study spaces by ID or name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Space ID or name..."
            className="liquid-input w-full pl-10 pr-4 py-2.5 rounded-full text-sm text-black placeholder:text-black/45"
          />
        </div>

        <select
          aria-label="Filter by building"
          value={buildingFilter}
          onChange={(e) =>
            setBuildingFilter(e.target.value as BuildingName | 'All')
          }
          className="liquid-input px-4 py-2.5 rounded-full text-sm text-black"
        >
          <option value="All">All Buildings</option>
          {BUILDINGS.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by occupancy status"
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as OccupancyStatus | 'All')
          }
          className="liquid-input px-4 py-2.5 rounded-full text-sm text-black"
        >
          <option value="All">All Occupancy Statuses</option>
          <option value="Available">Available</option>
          <option value="Occupied">Occupied</option>
          <option value="Reserved">Reserved</option>
          <option value="Maintenance">Maintenance</option>
        </select>
      </div>

      {/* Spaces Table */}
      <div className="liquid-glass rounded-[28px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-900/[0.06] bg-slate-900/[0.025] text-xs font-semibold text-black">
                <th className="py-3.5 px-5">Space ID</th>
                <th className="py-3.5 px-4">Space Name</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4 text-right">Capacity</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Facilities</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900/[0.05] text-xs">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="py-12 text-center text-sm text-black"
                  >
                    No study spaces match your search criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((sp) => (
                  <tr
                    key={sp.id}
                    className={`hover:bg-slate-900/[0.02] transition-colors ${
                      !sp.isActive ? 'opacity-60' : ''
                    }`}
                  >
                    <td className="py-3.5 px-5 font-mono font-semibold text-black tabular-nums whitespace-nowrap">
                      {sp.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-black block">
                        {sp.name}
                      </span>
                      {!sp.isActive && (
                        <span className="text-[11px] text-[#D32F2F] font-medium">
                          Deactivated
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-black whitespace-nowrap">
                      {sp.building} · {sp.floor}
                    </td>
                    <td className="py-3.5 px-4 text-black whitespace-nowrap">
                      {sp.spaceType}
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold text-black tabular-nums">
                      {sp.capacity}
                    </td>
                    <td className="py-3.5 px-4">
                      <OccupancyStatusBadge status={sp.occupancyStatus} compact />
                    </td>
                    <td className="py-3.5 px-4 text-black max-w-xs">
                      {sp.facilities.join(', ')}
                    </td>
                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(sp)}
                          aria-label={`Edit ${sp.name}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/[0.05] text-xs font-medium text-black hover:bg-slate-900/[0.09] transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setToggleTarget(sp)}
                          aria-label={
                            sp.isActive
                              ? `Deactivate ${sp.name}`
                              : `Reactivate ${sp.name}`
                          }
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                            sp.isActive
                              ? 'bg-[#E53935]/[0.10] text-[#D32F2F] hover:bg-[#E53935]/[0.18]'
                              : 'bg-[#1F9D55]/[0.12] text-[#177E43] hover:bg-[#1F9D55]/[0.20]'
                          }`}
                        >
                          <Power className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>{sp.isActive ? 'Deactivate' : 'Activate'}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Space Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 backdrop-blur-md p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="space-form-title"
        >
          <div className="liquid-glass-elevated rounded-[28px] max-w-xl w-full p-6 my-8">
            <div className="flex items-center justify-between">
              <h3
                id="space-form-title"
                className="font-display text-lg font-bold text-black"
              >
                {editingId ? `Edit Study Space (${editingId})` : 'Add New Study Space'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="Close study space form"
                className="p-2 rounded-full text-black hover:text-black hover:bg-slate-900/5 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div
                role="alert"
                className="mt-4 rounded-2xl bg-[#E53935]/10 px-4 py-2.5 text-xs text-[#D32F2F]"
              >
                {formError}
              </div>
            )}

            <form onSubmit={handleSave} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="space-name"
                    className="block text-xs font-semibold text-black mb-1"
                  >
                    Space Name
                  </label>
                  <input
                    id="space-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. B-09-03"
                    className="liquid-input w-full px-3.5 py-2 rounded-2xl text-sm text-black"
                  />
                </div>

                <div>
                  <label
                    htmlFor="space-building"
                    className="block text-xs font-semibold text-black mb-1"
                  >
                    Building
                  </label>
                  <select
                    id="space-building"
                    value={building}
                    onChange={(e) => setBuilding(e.target.value as BuildingName)}
                    className="liquid-input w-full px-3.5 py-2 rounded-2xl text-sm text-black"
                  >
                    {BUILDINGS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="space-floor"
                    className="block text-xs font-semibold text-black mb-1"
                  >
                    Floor
                  </label>
                  <input
                    id="space-floor"
                    type="text"
                    value={floor}
                    onChange={(e) => setFloor(e.target.value)}
                    placeholder="e.g. Level 9"
                    className="liquid-input w-full px-3.5 py-2 rounded-2xl text-sm text-black"
                  />
                </div>

                <div>
                  <label
                    htmlFor="space-type"
                    className="block text-xs font-semibold text-black mb-1"
                  >
                    Space Type
                  </label>
                  <select
                    id="space-type"
                    value={spaceType}
                    onChange={(e) => setSpaceType(e.target.value as SpaceType)}
                    className="liquid-input w-full px-3.5 py-2 rounded-2xl text-sm text-black"
                  >
                    {SPACE_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="space-capacity"
                    className="block text-xs font-semibold text-black mb-1"
                  >
                    Maximum Capacity
                  </label>
                  <input
                    id="space-capacity"
                    type="number"
                    min={1}
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    className="liquid-input w-full px-3.5 py-2 rounded-2xl text-sm text-black tabular-nums"
                  />
                </div>

                <div>
                  <label
                    htmlFor="space-status"
                    className="block text-xs font-semibold text-black mb-1"
                  >
                    Occupancy Status
                  </label>
                  <select
                    id="space-status"
                    value={occupancyStatus}
                    onChange={(e) =>
                      setOccupancyStatus(e.target.value as OccupancyStatus)
                    }
                    className="liquid-input w-full px-3.5 py-2 rounded-2xl text-sm text-black"
                  >
                    <option value="Available">Available</option>
                    <option value="Occupied">Occupied</option>
                    <option value="Reserved">Reserved</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="space-desc"
                  className="block text-xs font-semibold text-black mb-1"
                >
                  Description
                </label>
                <textarea
                  id="space-desc"
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe seating layout, lighting, and suitability..."
                  className="liquid-input w-full px-3.5 py-2 rounded-2xl text-sm text-black"
                />
              </div>

              <div>
                <span className="block text-xs font-semibold text-black mb-1.5">
                  Facilities
                </span>
                <div className="flex flex-wrap gap-2">
                  {ALL_FACILITIES.map((f) => {
                    const checked = facilities.includes(f);
                    return (
                      <label
                        key={f}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                          checked
                            ? 'bg-[#007AFF] text-white'
                            : 'bg-slate-900/[0.05] text-black'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleFacility(f)}
                          className="sr-only"
                        />
                        <span>{f}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label
                  htmlFor="space-image-preset"
                  className="block text-xs font-semibold text-black mb-1"
                >
                  Space Image
                </label>
                <select
                  id="space-image-preset"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="liquid-input w-full px-3.5 py-2 rounded-2xl text-sm text-black"
                >
                  {IMAGE_PRESETS.map((p) => (
                    <option key={p.url} value={p.url}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-full bg-slate-900/[0.06] text-sm font-medium text-black hover:bg-slate-900/[0.10] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#007AFF] text-white text-sm font-semibold hover:bg-[#0066D6] cursor-pointer"
                >
                  {editingId ? 'Save Space Changes' : 'Create Study Space'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deactivate/Activate Confirm */}
      <ConfirmDialog
        open={Boolean(toggleTarget)}
        title={
          toggleTarget?.isActive
            ? `Deactivate ${toggleTarget?.name}?`
            : `Reactivate ${toggleTarget?.name}?`
        }
        description={
          toggleTarget?.isActive
            ? 'Deactivating this space hides it from student and lecturer discovery and prevents new bookings.'
            : 'Reactivating this space restores it to student and lecturer discovery.'
        }
        confirmLabel={
          toggleTarget?.isActive ? 'Deactivate Space' : 'Reactivate Space'
        }
        cancelLabel="Cancel"
        tone={toggleTarget?.isActive ? 'danger' : 'primary'}
        onCancel={() => setToggleTarget(null)}
        onConfirm={() => {
          if (toggleTarget) {
            onToggleSpaceActive(toggleTarget.id);
            setToggleTarget(null);
          }
        }}
      />
    </div>
  );
}
