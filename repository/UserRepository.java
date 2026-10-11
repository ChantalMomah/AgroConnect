package com.agroconnect.repository;

import com.agroconnect.model.User;
import com.agroconnect.model.User.UserRole;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Boolean existsByEmail(String email);

    long countByRole(UserRole role);

    List<User> findByRole(UserRole role);

    List<User> findByState(String state);

    List<User> findByFullNameContainingIgnoreCase(String name);

    List<User> findTop5ByOrderByCreatedAtDesc();


    // ==========================================
    // SEARCH USERS
    // ==========================================

    @Query("""
        SELECT u
        FROM User u
        WHERE u.active = true
          AND u.role <> com.agroconnect.model.User$UserRole.ADMIN
          AND (
              LOWER(u.fullName) LIKE LOWER(CONCAT('%', :query, '%'))
              OR LOWER(COALESCE(u.businessName, '')) LIKE LOWER(CONCAT('%', :query, '%'))
          )
        ORDER BY u.fullName ASC
        """)
    List<User> searchUsers(@Param("query") String query);

    @Query("""
    SELECT u
    FROM User u
    WHERE u.role <> com.agroconnect.model.User$UserRole.ADMIN
    ORDER BY u.createdAt DESC
""")
List<User> findAllNonAdminUsers();
}