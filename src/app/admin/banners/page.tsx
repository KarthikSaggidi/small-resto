"use client";

import {
  Plus,
  Trash2,
  Edit3,
  X,
  Image as ImageIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Banner,
  getBanners,
  addBanner,
  updateBanner,
  deleteBanner,
} from "@/lib/store";

const emptyBanner = {
  title: "",
  subtitle: "",
  image: "",
  buttonText: "Order Now",
  buttonLink: "/cakes",
  active: true,
};

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [form, setForm] = useState(emptyBanner);

  function load() {
    setBanners(getBanners());
  }

  useEffect(() => {
    load();

    const handler = () => load();

    window.addEventListener("thirumala-store-update", handler);

    return () =>
      window.removeEventListener(
        "thirumala-store-update",
        handler
      );
  }, []);

  function openAdd() {
    setEditing(null);
    setForm(emptyBanner);
    setModal(true);
  }

  function openEdit(banner: Banner) {
    setEditing(banner);
    setForm({
      title: banner.title,
      subtitle: banner.subtitle,
      image: banner.image,
      buttonText: banner.buttonText,
      buttonLink: banner.buttonLink,
      active: banner.active,
    });
    setModal(true);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();

    if (editing) {
      updateBanner(editing.id, form);
    } else {
      addBanner(form);
    }

    setModal(false);
    load();
  }

  return (
    <section>
      <div className="admin-page-header">
        <div>
          <div className="admin-eyebrow">WEBSITE CONTENT</div>
          <h1>Banners</h1>
          <p>
            Manage promotional banners displayed on the storefront.
          </p>
        </div>

        <button className="admin-primary-button" onClick={openAdd}>
          <Plus size={17} />
          Add Banner
        </button>
      </div>

      <div className="banner-admin-grid">
        {banners.map((banner) => (
          <div className="banner-admin-card" key={banner.id}>
            <div className="banner-admin-image">
              {banner.image ? (
                <img src={banner.image} alt={banner.title} />
              ) : (
                <ImageIcon size={30} />
              )}

              <span
                className={`status-pill ${
                  banner.active ? "active" : "inactive"
                }`}
              >
                {banner.active ? "Live" : "Hidden"}
              </span>
            </div>

            <div className="banner-admin-body">
              <h2>{banner.title}</h2>
              <p>{banner.subtitle}</p>

              <div className="banner-admin-actions">
                <button
                  className="admin-secondary-button"
                  onClick={() => openEdit(banner)}
                >
                  <Edit3 size={15} />
                  Edit
                </button>

                <button
                  className="table-danger-button"
                  onClick={() => {
                    if (confirm(`Delete ${banner.title}?`)) {
                      deleteBanner(banner.id);
                      load();
                    }
                  }}
                >
                  <Trash2 size={15} />
                </button>

                <button
                  className="banner-toggle"
                  onClick={() => {
                    updateBanner(banner.id, {
                      active: !banner.active,
                    });
                    load();
                  }}
                >
                  {banner.active ? "Hide" : "Publish"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <div>
                <div className="admin-eyebrow">HOMEPAGE BANNER</div>
                <h2>
                  {editing ? "Edit Banner" : "Add Banner"}
                </h2>
              </div>

              <button onClick={() => setModal(false)}>
                <X size={19} />
              </button>
            </div>

            <form onSubmit={submit}>
              <div className="settings-grid">
                <label className="admin-field full">
                  <span>Title</span>
                  <input
                    required
                    value={form.title}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        title: e.target.value,
                      })
                    }
                  />
                </label>

                <label className="admin-field full">
                  <span>Subtitle</span>
                  <input
                    value={form.subtitle}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        subtitle: e.target.value,
                      })
                    }
                  />
                </label>

                <label className="admin-field full">
                  <span>Image URL</span>
                  <input
                    required
                    value={form.image}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        image: e.target.value,
                      })
                    }
                  />
                </label>

                <label className="admin-field">
                  <span>Button Text</span>
                  <input
                    value={form.buttonText}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        buttonText: e.target.value,
                      })
                    }
                  />
                </label>

                <label className="admin-field">
                  <span>Button Link</span>
                  <input
                    value={form.buttonLink}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        buttonLink: e.target.value,
                      })
                    }
                  />
                </label>
              </div>

              <div className="modal-checkboxes">
                <label>
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        active: e.target.checked,
                      })
                    }
                  />
                  Publish this banner
                </label>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-secondary-button"
                  onClick={() => setModal(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="admin-primary-button"
                >
                  {editing ? "Update Banner" : "Create Banner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
