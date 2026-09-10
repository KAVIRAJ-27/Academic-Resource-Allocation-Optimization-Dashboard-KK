package com.ahrao.repository.user;

import com.ahrao.entity.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    Optional<User> findByUsernameOrEmail(String username, String email);

    @org.springframework.data.jpa.repository.Query(
        "SELECT DISTINCT u FROM User u " +
        "LEFT JOIN FETCH u.roles r " +
        "LEFT JOIN FETCH r.permissions " +
        "WHERE u.username = :identifier OR u.email = :identifier"
    )
    Optional<User> findByIdentifierWithRoles(@org.springframework.data.repository.query.Param("identifier") String identifier);

    @org.springframework.data.jpa.repository.Query(
        "SELECT DISTINCT u FROM User u " +
        "LEFT JOIN FETCH u.roles r " +
        "LEFT JOIN FETCH r.permissions " +
        "ORDER BY u.id DESC"
    )
    java.util.List<User> findAllWithRoles();

    boolean existsByUsername(String username);
    boolean existsByEmail(String email);

    @org.springframework.data.jpa.repository.Query("SELECT r.name, COUNT(u) FROM User u JOIN u.roles r GROUP BY r.name")
    java.util.List<Object[]> countUsersByRoleName();

    @org.springframework.data.jpa.repository.Query(
        "SELECT COUNT(u) FROM User u JOIN u.roles r WHERE r.name = 'ADMIN' AND u.status = com.ahrao.entity.enums.UserStatus.ACTIVE"
    )
    long countActiveAdmins();

    @org.springframework.data.jpa.repository.Query(
        "SELECT COUNT(u) FROM User u JOIN u.roles r WHERE r.name = 'ADMIN' AND u.status = com.ahrao.entity.enums.UserStatus.ACTIVE AND u.id <> :userId"
    )
    long countOtherActiveAdmins(@org.springframework.data.repository.query.Param("userId") Long userId);

    @org.springframework.data.jpa.repository.Query(
        "SELECT u FROM User u JOIN u.roles r " +
        "WHERE r.name = 'STUDENT' AND u.id NOT IN (SELECT s.user.id FROM Student s) " +
        "ORDER BY u.firstName ASC, u.lastName ASC"
    )
    java.util.List<User> findUnassignedStudentUsers();

    @org.springframework.data.jpa.repository.Query(
        "SELECT u FROM User u " +
        "WHERE u.id NOT IN (SELECT f.user.id FROM Faculty f) " +
        "ORDER BY u.firstName ASC, u.lastName ASC"
    )
    java.util.List<User> findUnassignedFacultyUsers();

    @org.springframework.data.jpa.repository.Query(
        "SELECT u FROM User u " +
        "WHERE u.id NOT IN (SELECT w.user.id FROM Warden w) " +
        "ORDER BY u.firstName ASC, u.lastName ASC"
    )
    java.util.List<User> findUnassignedWardenUsers();
}
