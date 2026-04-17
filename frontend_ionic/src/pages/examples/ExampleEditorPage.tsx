/**
 * World Pieces — Example editor page.
 * Used for both creating new examples and editing existing ones.
 */
import React, { useEffect, useState } from 'react';
import {
  IonContent, IonHeader, IonPage, IonToolbar, IonTitle,
  IonButtons, IonBackButton, IonButton, IonItem, IonLabel,
  IonInput, IonTextarea, IonSelect, IonSelectOption,
  IonSpinner, IonToast,
} from '@ionic/react';
import { useParams, useHistory } from 'react-router-dom';
import { examplesApi } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { DISCIPLINES } from '../../utils/disciplines';

const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];

const ExampleEditorPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const history = useHistory();
  const { isAuthenticated, user } = useAuthStore();
  const isEditing = Boolean(id);

  const [title, setTitle] = useState('');
  const [discipline, setDiscipline] = useState('');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [tags, setTags] = useState('');
  const [problemSummary, setProblemSummary] = useState('');
  const [solutionExplanation, setSolutionExplanation] = useState('');
  const [pythonCode, setPythonCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      history.replace('/login');
      return;
    }
    if (isEditing && id) {
      setLoading(true);
      examplesApi
        .get(id)
        .then((res) => {
          const ex = res.data;
          setTitle(ex.title);
          setDiscipline(ex.discipline);
          setDifficulty(ex.difficulty);
          setTags(ex.tags.join(', '));
          setProblemSummary(ex.problem_summary);
          setSolutionExplanation(ex.solution_explanation);
          setPythonCode(ex.python_code);
        })
        .catch(() => setToast('Failed to load example'))
        .finally(() => setLoading(false));
    }
  }, [id, isEditing, isAuthenticated, history]);

  const handleSave = async () => {
    if (!title || !discipline || !problemSummary || !pythonCode) {
      setToast('Please fill in all required fields');
      return;
    }
    setSaving(true);
    const payload = {
      title,
      discipline,
      difficulty,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      problem_summary: problemSummary,
      solution_explanation: solutionExplanation,
      python_code: pythonCode,
    };
    try {
      if (isEditing && id) {
        await examplesApi.update(id, payload);
        setToast('Example updated successfully');
        setTimeout(() => history.replace(`/app/examples/${id}`), 1200);
      } else {
        const res = await examplesApi.create(payload);
        setToast('Example created successfully');
        setTimeout(() => history.replace(`/app/examples/${res.data.id}`), 1200);
      }
    } catch (err: any) {
      setToast(err?.response?.data?.detail ?? 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start"><IonBackButton /></IonButtons>
            <IonTitle>Loading…</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <IonSpinner name="crescent" />
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/app/disciplines" />
          </IonButtons>
          <IonTitle>{isEditing ? 'Edit Example' : 'New Example'}</IonTitle>
          <IonButtons slot="end">
            <IonButton strong onClick={handleSave} disabled={saving}>
              {saving ? <IonSpinner name="crescent" /> : 'Save'}
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <div style={{ padding: '1rem', maxWidth: '800px', margin: '0 auto' }}>
          <IonItem>
            <IonLabel position="stacked">Title *</IonLabel>
            <IonInput
              value={title}
              onIonInput={(e) => setTitle(e.detail.value ?? '')}
              placeholder="e.g. Quantum Harmonic Oscillator Energy Levels"
            />
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Discipline *</IonLabel>
            <IonSelect
              value={discipline}
              onIonChange={(e) => setDiscipline(e.detail.value)}
              placeholder="Select discipline"
            >
              {DISCIPLINES.map((d) => (
                <IonSelectOption key={d.key} value={d.key}>
                  {d.label}
                </IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Difficulty *</IonLabel>
            <IonSelect
              value={difficulty}
              onIonChange={(e) => setDifficulty(e.detail.value)}
            >
              {DIFFICULTIES.map((d) => (
                <IonSelectOption key={d} value={d}>
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Tags (comma-separated)</IonLabel>
            <IonInput
              value={tags}
              onIonInput={(e) => setTags(e.detail.value ?? '')}
              placeholder="e.g. wave function, Schrödinger, statistics"
            />
          </IonItem>

          <IonItem style={{ marginTop: '1rem' }}>
            <IonLabel position="stacked">Problem Summary *</IonLabel>
            <IonTextarea
              value={problemSummary}
              onIonInput={(e) => setProblemSummary(e.detail.value ?? '')}
              placeholder="Describe the real-world problem this example addresses…"
              autoGrow
              rows={4}
            />
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Detailed Solution Explanation</IonLabel>
            <IonTextarea
              value={solutionExplanation}
              onIonInput={(e) => setSolutionExplanation(e.detail.value ?? '')}
              placeholder="Walk through the mathematical and conceptual solution step by step…"
              autoGrow
              rows={8}
            />
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Python Code *</IonLabel>
            <IonTextarea
              value={pythonCode}
              onIonInput={(e) => setPythonCode(e.detail.value ?? '')}
              placeholder="# Paste your Python code here…"
              autoGrow
              rows={12}
              style={{ fontFamily: 'Source Code Pro, monospace', fontSize: '0.85rem' }}
            />
          </IonItem>

          <div style={{ padding: '1rem 0' }}>
            <IonButton expand="block" onClick={handleSave} disabled={saving}>
              {saving ? <IonSpinner name="crescent" /> : isEditing ? 'Update Example' : 'Publish Example'}
            </IonButton>
          </div>
        </div>

        <IonToast
          isOpen={!!toast}
          message={toast}
          duration={2500}
          onDidDismiss={() => setToast('')}
        />
      </IonContent>
    </IonPage>
  );
};

export default ExampleEditorPage;
