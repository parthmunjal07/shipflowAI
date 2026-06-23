"use client";

import { useState } from "react";
import { trpc } from "../../../../../trpc/client";
import { useRouter } from "next/navigation";

export default function IntakePage({
  params,
}: {
  params: { projectId: string };
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [success, setSuccess] = useState(false);

  const createRequest = trpc.featureRequest.create.useMutation({
    onSuccess: () => {
      setSuccess(true);
      setTitle("");
      setContent("");
      setEmail("");
      setName("");
      // Optionally route to a success page
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createRequest.mutate({
      intakeToken: params.projectId, // TODO: Move this to a dedicated public route
      title,
      content,
      submitterEmail: email,
      submitterName: name,
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 mt-12 bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Submit a Feature Request</h1>
        <p className="text-slate-500 mt-2">
          Have an idea or need something new? Let us know below.
        </p>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg">
          Thanks! Your feature request has been submitted successfully.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Title
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            placeholder="E.g., Add dark mode support"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Details
          </label>
          <textarea
            required
            rows={5}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            placeholder="Please describe the problem you're facing and your proposed solution..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Your Name (Optional)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="Jane Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Your Email (Optional)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="jane@example.com"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={createRequest.isPending}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {createRequest.isPending ? "Submitting..." : "Submit Feature Request"}
        </button>
      </form>
    </div>
  );
}
