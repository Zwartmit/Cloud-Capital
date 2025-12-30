Test 1: Usuario con 50% de Progreso
Login: test1@example.com / test123

✅ Badge: "Activo" (verde)
✅ CycleProgressCard: Barra al 50%
✅ Depósitos: $100
✅ Profit: $50
✅ Meta: $200
❌ Modal NO aparece

Ubicación en UI:

Dashboard → Header (badge)
Dashboard → Scroll abajo (CycleProgressCard)

Test 2: Usuario con 150% de Progreso
Login: test2@example.com / test123

✅ Badge: "Activo" (verde)
✅ CycleProgressCard: Barra al 150%
✅ Depósitos: $200
✅ Profit: $300
✅ Meta: $400
❌ Modal NO aparece (aún no llega a 200%)

Test 3: ⭐ Usuario con Ciclo COMPLETADO (200%)
Login: test3@example.com / test123

✅ Badge: "Completado" (azul)

✅ CycleProgressCard: Barra al 200% + mensaje de felicitaciones
✅ MODAL APARECE AUTOMÁTICAMENTE 🎉
Título: "¡Felicidades!"
Profit total: $200
2 botones: "Retirar Todo" y "Reinvertir"
Ubicación en UI:

Modal aparece encima de todo (overlay)
No puedes navegar hasta elegir una opción
Acciones:

Click "Reinvertir" → Redirige a /reinvest
Click "Retirar Todo" → Redirige a /withdraw con monto pre-llenado

Test 4: Usuario Pendiente de Plan
Login: test4@example.com / test123

✅ Badge: "Pendiente Plan" (amarillo)

✅ Capital: $75
✅ Sin plan activo
✅ Debe seleccionar plan para continuar
Flujo:

Ve a página de planes
Selecciona un plan
Badge cambia a "Activo"

Test 5: Usuario con Plan Expirando
Login: test5@example.com / test123

✅ Badge: "Activo"

✅ Plan: PLATINUM
✅ Días restantes: 3
✅ Útil para probar cron job de verificación
Testing de Cron:

El cron job diario detectará este usuario
Enviará notificación (cuando se implemente)
