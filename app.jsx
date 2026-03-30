import { useState, useEffect } from "react";
// 1. Importamos la conexión a la base de datos y las funciones de Firebase
import { db } from "./firebase"; 
import { collection, addDoc, getDocs, onSnapshot, query, deleteDoc, doc } from "firebase/firestore";

// ... (Tus constantes PLATFORMS, DAYS, MONTHS se quedan igual)

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [posts, setPosts] = useState([]); // Empezamos vacío para cargar de Firebase
  const [ideas, setIdeas] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editPost, setEditPost] = useState(null);
  const [ideaForm, setIdeaForm] = useState(false);
  const [newIdea, setNewIdea] = useState({ platform: "instagram", title: "", tags: "", priority: "media" });
  const [filterPlatform, setFilterPlatform] = useState("all");

  // 2. EFECTO PARA CARGAR POSTS EN TIEMPO REAL
  useEffect(() => {
    const q = query(collection(db, "posts"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const postsArray = [];
      querySnapshot.forEach((doc) => {
        postsArray.push({ ...doc.data(), id: doc.id });
      });
      setPosts(postsArray);
    });
    return () => unsubscribe();
  }, []);

  // 3. FUNCIÓN PARA GUARDAR POST EN FIREBASE
  const handleSavePost = async (form) => {
    try {
      if (editPost) {
        // Aquí iría la lógica de actualización (updateDoc)
        setEditPost(null);
      } else {
        // GUARDAR NUEVO: Esto lo envía a la nube
        await addDoc(collection(db, "posts"), {
          ...form,
          likes: 0,
          reach: 0,
          createdAt: new Date()
        });
      }
      setShowForm(false);
    } catch (e) {
      console.error("Error al guardar: ", e);
    }
  };

  // 4. FUNCIÓN PARA BORRAR DE FIREBASE
  const handleDeletePost = async (id) => {
    await deleteDoc(doc(db, "posts", id));
  };

  // ... (El resto de tu diseño de UI se queda igual)
  
  return (
    // ... (Todo tu código de renderizado que ya tenías)
  );
}
