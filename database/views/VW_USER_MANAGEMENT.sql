-- =====================================================
-- Vista: VW_USER_MANAGEMENT
-- Descripción: Vista para gestión de usuarios con información 
--              de roles y estados ya unificada
-- Autor: GeStock Team
-- Fecha: 2025-10-26
-- =====================================================

CREATE OR REPLACE VIEW VW_USER_MANAGEMENT AS
SELECT 
  u.USER_ID,
  u.NAME,
  u.EMAIL,
  u.ROLE_ID,
  r.ROLE_NAME,
  u.STATE_ID,
  s.STATE_NAME
FROM USERS u
LEFT JOIN ROLES r ON u.ROLE_ID = r.ROLE_ID
LEFT JOIN USER_STATES s ON u.STATE_ID = s.STATE_ID;

-- Comentarios para documentación
COMMENT ON TABLE VW_USER_MANAGEMENT IS 'Vista para gestión de usuarios con roles y estados';
COMMENT ON COLUMN VW_USER_MANAGEMENT.USER_ID IS 'ID único del usuario';
COMMENT ON COLUMN VW_USER_MANAGEMENT.NAME IS 'Nombre completo del usuario';
COMMENT ON COLUMN VW_USER_MANAGEMENT.EMAIL IS 'Email del usuario';
COMMENT ON COLUMN VW_USER_MANAGEMENT.ROLE_ID IS 'ID del rol asignado';
COMMENT ON COLUMN VW_USER_MANAGEMENT.ROLE_NAME IS 'Nombre del rol (ADMIN, JEFE DE ALMACEN, OPERARIO)';
COMMENT ON COLUMN VW_USER_MANAGEMENT.STATE_ID IS 'ID del estado del usuario';
COMMENT ON COLUMN VW_USER_MANAGEMENT.STATE_NAME IS 'Nombre del estado (Activo, Inactivo)';

-- Verificar la vista
SELECT * FROM VW_USER_MANAGEMENT ORDER BY USER_ID;
